"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { FeedComment } from "@/lib/api-types";
import { useAuth } from "@/lib/auth-context";
import { userFacingApiError } from "@/lib/api-client";
import { useToast } from "@/components/ToastProvider";
import { t } from "@/lib/i18n/t";


export default function CommentThread({
  comment,
  locale,
  dict,
  canModerate,
  canInteract = true,
  onDeleted,
  onUpdated,
  onCountChange,
  depth = 0
}: {
  comment: FeedComment;
  locale: Locale;
  dict: Dictionary;
  canModerate: boolean;
  canInteract?: boolean;
  onDeleted: (id: string, removedCount: number) => void;
  onUpdated: (id: string, content: string) => void;
  onCountChange?: (delta: number) => void;
  depth?: number;
}) {
  const { user, updateComment, deleteComment, addReply, getCommentReplies } = useAuth();
  const { confirm, showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(comment.content);
  const [replying, setReplying] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [replies, setReplies] = useState<FeedComment[] | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isOwner = comment.isOwner;
  const canEdit = isOwner && canInteract;
  const canDelete = (isOwner && canInteract) || canModerate;

  async function loadReplies() {
    if (replies) {
      setRepliesOpen((v) => !v);
      return;
    }
    setRepliesLoading(true);
    try {
      const items = await getCommentReplies(comment.id, locale);
      setReplies(items);
      setRepliesOpen(true);
    } catch (err) {
      showToast(
        userFacingApiError(err, dict.community.commentLoadError, {
          loginRequired: dict.community.loginRequired,
          subscriptionRequired: dict.community.subscriptionRequired,
        }),
        { variant: "error" },
      );
    } finally {
      setRepliesLoading(false);
    }
  }

  async function saveEdit() {
    if (!editDraft.trim() || submitting) return;
    setSubmitting(true);
    try {
      const message = await updateComment(comment.id, editDraft.trim(), locale);
      onUpdated(comment.id, editDraft.trim());
      setEditing(false);
      showToast(message || dict.common.save, { variant: "success" });
    } catch (err) {
      showToast(userFacingApiError(err, dict.community.commentEditError), { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  function remove() {
    confirm({
      message: dict.community.deleteCommentConfirm,
      confirmLabel: dict.community.deleteComment,
      cancelLabel: dict.common.cancel,
      onConfirm: async () => {
        try {
          const message = await deleteComment(comment.id, locale);
          const removedCount = 1 + (comment.repliesCount ?? 0);
          onDeleted(comment.id, removedCount);
          showToast(message || dict.community.commentDeleteSuccess, { variant: "success" });
        } catch (err) {
          showToast(userFacingApiError(err, dict.community.commentDeleteError), { variant: "error" });
          throw err;
        }
      },
    });
  }

  async function submitReply() {
    if (!replyDraft.trim() || submitting) return;
    setSubmitting(true);
    try {
      const message = await addReply(comment.id, replyDraft.trim(), locale);
      setReplyDraft("");
      setReplying(false);
      const items = await getCommentReplies(comment.id, locale);
      setReplies(items);
      setRepliesOpen(true);
      onCountChange?.(1);
      showToast(message || dict.common.reply, { variant: "success" });
    } catch (err) {
      showToast(
        userFacingApiError(err, dict.community.commentCreateError, {
          loginRequired: dict.community.loginRequired,
          subscriptionRequired: dict.community.subscriptionRequired,
        }),
        { variant: "error" },
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={depth > 0 ? "ms-9" : ""}>
      <div className="flex items-start gap-2.5">
        <img
          src={comment.user.profileImage || "/images/avatar-placeholder.jpg"}
          alt=""
          className="h-8 w-8 shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="rounded-2xl bg-paper px-3.5 py-2.5">
            <p className="text-xs font-semibold text-ink">{comment.user.name}</p>
            {editing ? (
              <div className="mt-1">
                <textarea
                  value={editDraft}
                  onChange={(e) => setEditDraft(e.target.value)}
                  rows={2}
                  className="w-full resize-none rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs outline-none focus:border-primary-400"
                />
                <div className="mt-1.5 flex justify-end gap-3">
                  <button onClick={() => setEditing(false)} className="text-[11px] font-medium text-ink/65">
                    {dict.common.cancel}
                  </button>
                  <button
                    onClick={() => void saveEdit()}
                    disabled={submitting}
                    className="text-[11px] font-semibold text-primary-700 disabled:opacity-50"
                  >
                    {dict.common.save}
                  </button>
                </div>
              </div>
            ) : (
              <p className="whitespace-pre-line text-xs leading-5 text-ink/75">{comment.content}</p>
            )}
          </div>

          {!editing && (
            <div className="mt-1 flex items-center gap-3 text-[11px] font-medium text-ink/55">
              <span>{comment.createdAt}</span>
              {canInteract && (
                <button onClick={() => setReplying((v) => !v)} className="hover:text-primary-600">
                  {dict.common.reply}
                </button>
              )}
              {canEdit && (
                <button onClick={() => setEditing(true)} className="hover:text-primary-600">
                  {dict.community.editComment}
                </button>
              )}
              {canDelete && (
                <button onClick={remove} className="hover:text-danger">
                  {dict.community.deleteComment}
                </button>
              )}
            </div>
          )}

          {canInteract && replying && (
            <div className="mt-1.5 flex items-center gap-2">
              <input
                value={replyDraft}
                onChange={(e) => setReplyDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void submitReply()}
                placeholder={dict.community.replyPlaceholder}
                className="w-full rounded-full border border-line bg-paper px-3 py-1.5 text-xs outline-none focus:border-primary-400"
              />
              <button
                onClick={() => void submitReply()}
                disabled={submitting || !replyDraft.trim()}
                aria-label="send"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white disabled:opacity-40"
              >
                <Send size={12} className="rtl:-scale-x-100" />
              </button>
            </div>
          )}

          {comment.repliesCount > 0 && !repliesOpen && (
            <button
              onClick={loadReplies}
              disabled={repliesLoading}
              className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-primary-600 hover:underline"
            >
              {repliesLoading && <Loader2 size={11} className="animate-spin" />}
              {t(dict.community.viewReplies, { count: comment.repliesCount })}
            </button>
          )}

          {repliesOpen && replies && (
            <div className="mt-2 space-y-2">
              {replies.map((r) => (
                <CommentThread
                  key={r.id}
                  comment={r}
                  locale={locale}
                  dict={dict}
                  canModerate={canModerate}
                  canInteract={canInteract}
                  onDeleted={(id, _removedCount) => {
                    setReplies((prev) => prev?.filter((x) => x.id !== id) ?? null);
                    onCountChange?.(-1);
                  }}
                  onUpdated={(id, content) =>
                    setReplies((prev) => prev?.map((x) => (x.id === id ? { ...x, content } : x)) ?? null)
                  }
                  onCountChange={onCountChange}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
