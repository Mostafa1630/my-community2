"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";

// Shared by both "create a post" (feed composer) and "edit a post" (inline
// in PostCard) — the backend only ever accepts up to two media files
// (media[0]/media[1]), so this caps attachments at 2 rather than pretending
// more are possible. Confirmed live: the media validation whitelist is
// jpg/jpeg/png/mp4/mov — images and short videos, not arbitrary documents
// (unlike lesson attachments, which do allow pdf/doc/etc on a different
// endpoint) — accept/preview both file kinds accordingly.
export default function PostComposer({
  dict,
  initialContent = "",
  submitLabel,
  placeholder,
  onSubmit,
  onCancel
}: {
  dict: Dictionary;
  initialContent?: string;
  submitLabel: string;
  placeholder: string;
  onSubmit: (content: string, media: File[]) => Promise<void>;
  onCancel?: () => void;
}) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState(initialContent);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function pickFiles(files: FileList | null) {
    if (!files) return;
    const picked = Array.from(files).slice(0, 2 - mediaFiles.length);
    if (picked.length === 0) return;
    setMediaFiles((prev) => [...prev, ...picked].slice(0, 2));
    setPreviews((prev) => [...prev, ...picked.map((f) => URL.createObjectURL(f))].slice(0, 2));
  }

  function removeMedia(i: number) {
    setMediaFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit() {
    if (!content.trim() || submitting) return;
    setError("");
    setSubmitting(true);
    try {
      await onSubmit(content.trim(), mediaFiles);
      setContent("");
      setMediaFiles([]);
      setPreviews([]);
    } catch (err) {
      // Shows the backend's own message (e.g. "Forbidden" on a 403 for not
      // being subscribed) rather than a generic fallback, so the "you're not
      // allowed to do this" reason is the actual reason, not a guess.
      setError(err instanceof ApiError ? err.message : dict.community.postCreateError);
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return null;

  return (
    <div>
      <div className="flex items-start gap-3">
        <img
          src={user.profileImage || "/images/avatar-placeholder.jpg"}
          alt=""
          className="h-9 w-9 shrink-0 rounded-full object-cover"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full resize-none border-0 bg-transparent text-sm leading-6 text-ink outline-none placeholder:text-ink/40"
        />
      </div>

      {previews.length > 0 && (
        <div className="mt-3 flex gap-2 ps-12">
          {previews.map((src, i) => (
            <div key={i} className="relative h-20 w-20 overflow-hidden rounded-xl border border-line">
              {mediaFiles[i]?.type.startsWith("video/") ? (
                <video src={src} className="h-full w-full object-cover" muted playsInline />
              ) : (
                <img src={src} alt="" className="h-full w-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => removeMedia(i)}
                aria-label="remove"
                className="absolute end-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-white"
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-2 ps-12 text-xs text-danger">{error}</p>}

      <div className="mt-3 flex items-center justify-between ps-12">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,video/mp4,video/quicktime"
          multiple
          className="hidden"
          onChange={(e) => pickFiles(e.target.files)}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={mediaFiles.length >= 2}
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
            disabled={submitting || !content.trim()}
            className="flex items-center gap-1.5 rounded-full bg-primary-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-600 disabled:opacity-50"
          >
            {submitting && <Loader2 size={13} className="animate-spin" />}
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
