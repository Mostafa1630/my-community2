"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, MessageCircle, Send } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { FeedComment } from "@/lib/api-types";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import CommentThread from "./CommentThread";
import EmptyState from "../EmptyState";

// Same infinite-scroll pattern as the post feed itself: page 1 loads up
// front, then a sentinel below the last comment fetches the next page as it
// scrolls into view.
export default function CommentsPanel({
  postId,
  locale,
  dict,
  canModerate,
  onCountChange
}: {
  postId: string;
  locale: Locale;
  dict: Dictionary;
  canModerate: boolean;
  // Lets the parent (the post's own comment-count badge in the tab label)
  // stay in sync without a full post refetch — comments/replies here are
  // fetched separately from the post itself, so nothing else updates it.
  onCountChange?: (delta: number) => void;
}) {
  const { user, getPostComments, addComment } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPostComments(postId, locale, 1)
      .then((res) => {
        if (cancelled) return;
        setComments(res.items);
        setPage(1);
        setHasMore(res.currentPage < res.lastPage);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, locale]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await getPostComments(postId, locale, nextPage);
      setComments((prev) => [...prev, ...res.items]);
      setPage(nextPage);
      setHasMore(res.currentPage < res.lastPage);
    } finally {
      setLoadingMore(false);
    }
  }, [postId, locale, page, hasMore, loadingMore, getPostComments]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading, loadMore]);

  async function submit() {
    if (!draft.trim() || submitting) return;
    setError("");
    setSubmitting(true);
    try {
      await addComment(postId, draft.trim(), locale);
      setDraft("");
      const res = await getPostComments(postId, locale, 1);
      setComments(res.items);
      setPage(1);
      setHasMore(res.currentPage < res.lastPage);
      onCountChange?.(1);
    } catch (err) {
      // The backend's own message (e.g. "Forbidden") is more useful here
      // than a generic fallback, same reasoning as the post composer.
      setError(err instanceof ApiError ? err.message : dict.community.commentCreateError);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 size={22} className="animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div>
      {user && (
        <div className="mb-4 flex items-center gap-2">
          <img
            src={user.profileImage || "/images/avatar-placeholder.jpg"}
            alt=""
            className="h-8 w-8 shrink-0 rounded-full object-cover"
          />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={dict.common.comment}
            className="w-full rounded-full border border-line bg-paper px-3.5 py-2 text-sm outline-none focus:border-primary-400"
          />
          <button
            onClick={submit}
            disabled={submitting || !draft.trim()}
            aria-label="send"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white disabled:opacity-40"
          >
            <Send size={14} className="rtl:-scale-x-100" />
          </button>
        </div>
      )}

      {error && <p className="mb-4 text-xs text-danger">{error}</p>}

      {comments.length === 0 ? (
        <EmptyState icon={MessageCircle} title={dict.community.noCommentsYet} />
      ) : (
        <>
          <div className="space-y-4">
            {comments.map((c) => (
              <CommentThread
                key={c.id}
                comment={c}
                locale={locale}
                dict={dict}
                canModerate={canModerate}
                onDeleted={(id) => {
                  setComments((prev) => prev.filter((x) => x.id !== id));
                  onCountChange?.(-1);
                }}
                onUpdated={(id, content) =>
                  setComments((prev) => prev.map((x) => (x.id === id ? { ...x, content } : x)))
                }
                onCountChange={onCountChange}
              />
            ))}
          </div>
          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-4">
              {loadingMore && <Loader2 size={18} className="animate-spin text-primary-500" />}
            </div>
          )}
        </>
      )}
    </div>
  );
}
