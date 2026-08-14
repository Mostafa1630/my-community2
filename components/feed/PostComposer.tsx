"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FileText, ImagePlus, Loader2, X } from "lucide-react";
import type { PostMediaItem } from "@/lib/api-types";
import { postMediaKind } from "@/lib/api-types";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ToastProvider";

export type PostComposerSubmitPayload = {
  content: string;
  newMedia: File[];
  removedMediaUrls: string[];
};

const MAX_MEDIA = 2;

function ExistingMediaPreview({
  item,
  onRemove,
}: {
  item: PostMediaItem;
  onRemove: () => void;
}) {
  const kind = postMediaKind(item);

  return (
    <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-line">
      {kind === "video" ? (
        <video src={item.url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
      ) : kind === "image" ? (
        <img src={item.url} alt={item.name ?? ""} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-paper p-1.5 text-center">
          <FileText size={20} className="shrink-0 text-primary-600" />
          <span className="line-clamp-2 w-full break-all text-[9px] leading-tight text-ink/65">
            {item.name ?? item.url.split("/").pop()}
          </span>
        </div>
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label="remove"
        className="absolute end-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-white"
      >
        <X size={11} />
      </button>
    </div>
  );
}

export default function PostComposer({
  dict,
  initialContent = "",
  initialExistingMedia = [],
  submitLabel,
  placeholder,
  onSubmit,
  onCancel,
  boxed = false,
  variant = "default",
}: {
  dict: Dictionary;
  initialContent?: string;
  initialExistingMedia?: PostMediaItem[];
  submitLabel: string;
  placeholder: string;
  onSubmit: (payload: PostComposerSubmitPayload) => Promise<void>;
  onCancel?: () => void;
  boxed?: boolean;
  variant?: "default" | "feed";
}) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState(initialContent);
  const [existingMedia, setExistingMedia] = useState<PostMediaItem[]>(initialExistingMedia);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(
    Boolean(initialContent) || initialExistingMedia.length > 0 || variant !== "feed",
  );
  const previewsRef = useRef<string[]>([]);
  previewsRef.current = previews;

  const totalMediaCount = existingMedia.length + mediaFiles.length;
  const removedMediaUrls = useMemo(
    () =>
      initialExistingMedia
        .filter((item) => !existingMedia.some((kept) => kept.url === item.url))
        .map((item) => item.url),
    [existingMedia, initialExistingMedia],
  );

  useEffect(() => {
    return () => {
      previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function pickFiles(files: FileList | null) {
    if (!files) return;
    const slotsLeft = Math.max(0, MAX_MEDIA - totalMediaCount);
    const picked = Array.from(files).slice(0, slotsLeft);
    if (picked.length === 0) return;
    setMediaFiles((prev) => [...prev, ...picked].slice(0, MAX_MEDIA - existingMedia.length));
    setPreviews((prev) => [...prev, ...picked.map((f) => URL.createObjectURL(f))].slice(0, MAX_MEDIA - existingMedia.length));
  }

  function removeNewMedia(index: number) {
    setPreviews((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed);
      return prev.filter((_, idx) => idx !== index);
    });
    setMediaFiles((prev) => prev.filter((_, idx) => idx !== index));
  }

  function removeExistingMedia(index: number) {
    setExistingMedia((prev) => prev.filter((_, idx) => idx !== index));
  }

  async function handleSubmit() {
    const trimmed = content.trim();
    if ((!trimmed && totalMediaCount === 0) || submitting) return;
    if (!user) {
      showToast(dict.community.loginRequired, { variant: "error" });
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        content: trimmed,
        newMedia: mediaFiles,
        removedMediaUrls,
      });
      setContent("");
      setExistingMedia([]);
      setPreviews((prev) => {
        prev.forEach((url) => URL.revokeObjectURL(url));
        return [];
      });
      setMediaFiles([]);
      if (variant === "feed") setExpanded(false);
    } catch {
      // Caller shows a toast — keep the draft so the user can retry.
    } finally {
      setSubmitting(false);
    }
  }

  const avatar = (
    <img
      src={user?.profileImage || "/images/avatar-placeholder.jpg"}
      alt=""
      className={`shrink-0 rounded-full object-cover ${variant === "feed" ? "h-10 w-10" : "h-9 w-9"}`}
    />
  );

  const previewsBlock = totalMediaCount > 0 && (
    <div className={`mt-3 flex flex-wrap gap-2 ${variant === "feed" ? "" : "ps-12"}`}>
      {existingMedia.map((item, index) => (
        <ExistingMediaPreview key={item.url} item={item} onRemove={() => removeExistingMedia(index)} />
      ))}
      {previews.map((src, index) => (
        <div key={src} className="relative h-20 w-20 overflow-hidden rounded-xl border border-line">
          {mediaFiles[index]?.type.startsWith("video/") ? (
            <video src={src} className="h-full w-full object-cover" muted playsInline />
          ) : mediaFiles[index]?.type.startsWith("image/") ? (
            <img src={src} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-paper p-1.5 text-center">
              <FileText size={20} className="shrink-0 text-primary-600" />
              <span className="line-clamp-2 w-full break-all text-[9px] leading-tight text-ink/65">
                {mediaFiles[index]?.name}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => removeNewMedia(index)}
            aria-label="remove"
            className="absolute end-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-white"
          >
            <X size={11} />
          </button>
        </div>
      ))}
    </div>
  );

  const actionsRow = (
    <div className={`mt-3 flex items-center justify-between ${variant === "feed" ? "pt-1" : "ps-12"}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,video/mp4,video/quicktime,application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip"
        multiple
        className="hidden"
        onChange={(e) => pickFiles(e.target.files)}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={totalMediaCount >= MAX_MEDIA}
        className="flex items-center gap-1.5 rounded-full px-2 py-1.5 text-xs font-medium text-ink/65 transition hover:bg-paper disabled:opacity-40"
      >
        <ImagePlus size={16} />
        {dict.community.addMedia}
      </button>
      <div className="flex items-center gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-line px-3.5 py-1.5 text-xs font-medium text-ink/65"
          >
            {dict.common.cancel}
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || (!content.trim() && totalMediaCount === 0)}
          className="flex items-center gap-1.5 rounded-full bg-primary-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-600 disabled:opacity-50"
        >
          {submitting && <Loader2 size={13} className="animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </div>
  );

  if (variant === "feed" && !expanded) {
    return (
      <div className="flex items-center gap-3">
        {avatar}
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="min-w-0 flex-1 rounded-full border border-line bg-paper px-4 py-2.5 text-start text-sm text-ink/45 transition hover:border-primary-200"
        >
          {placeholder}
        </button>
      </div>
    );
  }

  const textareaClass =
    variant === "feed" || boxed
      ? "rounded-xl border border-line bg-paper px-3.5 py-3 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
      : "border-0 bg-transparent";

  return (
    <div>
      <div className="flex items-start gap-3">
        {avatar}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={variant === "feed" || boxed ? 3 : 2}
          autoFocus={variant === "feed" && expanded}
          className={`w-full resize-none text-sm leading-6 text-ink placeholder:text-ink/40 ${textareaClass}`}
        />
      </div>

      {previewsBlock}
      {actionsRow}
    </div>
  );
}
