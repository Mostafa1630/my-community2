"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { FeedComment } from "@/lib/api-types";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { t } from "@/lib/i18n/t";

// canModerate covers both the community's own creator and the post's owner
// (per spec: a comment can be deleted by its author, the community creator,
// or whoever posted the post it's on) — the caller (CommentsPanel) computes
// that union once and passes it straight down.
export default function CommentThread({
  comment,
  locale,
  dict,
  canModerate,
  onDeleted,
  onUpdated,
  onCountChange,
  depth = 0
}: {
  comment: FeedComment;
  locale: Locale;
  dict: Dictionary;
  canModerate: boolean;
  onDeleted: (id: string) => void;
  onUpdated: (id: string, content: string) => void;
  onCountChange?: (delta: number) => void;
  depth?: number;
}) {
  const { updateComment, deleteComment, addReply, getCommentReplies } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(comment.content);
  const [replying, setReplying] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [replies, setReplies] = useState<FeedComment[] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [replyError, setReplyError] = useState("");

  const canEdit = comment.isOwner;
  const canDelete = comment.isOwner || canModerate;

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
    } finally {
      setRepliesLoading(false);
    }
  }

  async function saveEdit() {
    if (!editDraft.trim() || submitting) return;
    setSubmitting(true);
    try {
      await updateComment(comment.id, editDraft.trim(), locale);
      onUpdated(comment.id, editDraft.trim());
      setEditing(false);
    } finally {
      setSubmitting(false);
    }
  }

  async function remove() {
    if (!window.confirm(dict.community.deleteCommentConfirm)) return;
    await deleteComment(comment.id, locale);
    onDeleted(comment.id);
  }

  async function submitReply() {
    if (!replyDraft.trim() || submitting) return;
    setReplyError("");
    setSubmitting(true);
    try {
      await addReply(comment.id, replyDraft.trim(), locale);
      setReplyDraft("");
      setReplying(false);
      const items = await getCommentReplies(comment.id, locale);
      setReplies(items);
      setRepliesOpen(true);
      onCountChange?.(1);
    } catch (err) {
      setReplyError(err instanceof ApiError ? err.message : dict.community.commentCreateError);
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
                    onClick={saveEdit}
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
              <button onClick={() => setReplying((v) => !v)} className="hover:text-primary-600">
                {dict.common.reply}
              </button>
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

          {replying && (
            <div className="mt-1.5 flex items-center gap-2">
              <input
                value={replyDraft}
                onChange={(e) => setReplyDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitReply()}
                placeholder={dict.community.replyPlaceholder}
                className="w-full rounded-full border border-line bg-paper px-3 py-1.5 text-xs outline-none focus:border-primary-400"
              />
              <button
                onClick={submitReply}
                disabled={submitting || !replyDraft.trim()}
                aria-label="send"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white disabled:opacity-40"
              >
                <Send size={12} className="rtl:-scale-x-100" />
              </button>
            </div>
          )}
          {replyError && <p className="mt-1 text-[11px] text-danger">{replyError}</p>}

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
                  onDeleted={(id) => setReplies((prev) => prev?.filter((x) => x.id !== id) ?? null)}
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
