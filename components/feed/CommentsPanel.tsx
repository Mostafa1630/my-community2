"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, MessageCircle, Send } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { FeedComment } from "@/lib/api-types";
import { useAuth } from "@/lib/auth-context";
import { userFacingApiError } from "@/lib/api-client";
import { useToast } from "@/components/ToastProvider";
import CommentThread from "./CommentThread";
import EmptyState from "../EmptyState";


export default function CommentsPanel({
  postId,
  locale,
  dict,
  canModerate,
  canInteract = true,
  onCountChange,
  initialComments = [],
}: {
  postId: string;
  locale: Locale;
  dict: Dictionary;
  canModerate: boolean;
  canInteract?: boolean;
  onCountChange?: (delta: number) => void;
  initialComments?: FeedComment[];
}) {
  const { user, getPostComments, addComment, sessionReady, hydrated } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [comments, setComments] = useState<FeedComment[]>(initialComments);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hydrated || !sessionReady) return;

    let cancelled = false;
    setLoading(true);
    setLoadError("");
    getPostComments(postId, locale, 1)
      .then((res) => {
        if (cancelled) return;
        setComments(res.items);
        setPage(1);
        setHasMore(res.currentPage < res.lastPage);
      })
      .catch((err) => {
        if (!cancelled) {
          if (initialComments.length > 0) {
            setComments(initialComments);
            setLoadError("");
          } else {
            setComments([]);
            setLoadError(
              userFacingApiError(err, dict.community.commentsLoadError, {
                loginRequired: dict.community.loginRequired,
                subscriptionRequired: dict.community.subscriptionRequired,
              }),
            );
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };

  }, [postId, locale, reloadKey, hydrated, sessionReady]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await getPostComments(postId, locale, nextPage);
      setComments((prev) => [...prev, ...res.items]);
      setPage(nextPage);
      setHasMore(res.currentPage < res.lastPage);
    } catch {
      showToast(dict.community.loadMoreError, { variant: "error" });
    } finally {
      setLoadingMore(false);
    }
  }, [postId, locale, page, hasMore, loadingMore, getPostComments, showToast, dict.community.loadMoreError]);

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
    if (!user) {
      showToast(dict.community.loginRequired, { variant: "error" });
      return;
    }
    setSubmitting(true);
    try {
      const message = await addComment(postId, draft.trim(), locale);
      setDraft("");
      const pages = Array.from({ length: page }, (_, i) => i + 1);
      const results = await Promise.all(pages.map((p) => getPostComments(postId, locale, p)));
      const allItems = results.flatMap((r) => r.items);
      const last = results[results.length - 1];
      setComments(allItems);
      setHasMore(last ? last.currentPage < last.lastPage : false);
      onCountChange?.(1);
      showToast(message || dict.common.comment, { variant: "success" });
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

  if (!sessionReady || loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 size={22} className="animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div>
      {canInteract ? (
        <div className="mb-4 flex items-center gap-2">
          <img
            src={user?.profileImage || "/images/avatar-placeholder.jpg"}
            alt=""
            className="h-8 w-8 shrink-0 rounded-full object-cover"
          />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void submit()}
            placeholder={dict.community.feedCommentPlaceholder}
            className="w-full rounded-full border border-line bg-paper px-3.5 py-2 text-sm outline-none focus:border-primary-400"
          />
          <button
            onClick={() => void submit()}
            disabled={submitting || !draft.trim()}
            aria-label="send"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white disabled:opacity-40"
          >
            <Send size={14} className="rtl:-scale-x-100" />
          </button>
        </div>
      ) : (
        <p className="mb-4 rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink/70">
          {dict.community.subscriptionRequired}
        </p>
      )}

      {loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p>{loadError}</p>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="mt-2 font-semibold text-red-800 underline hover:no-underline"
          >
            {dict.common.retry}
          </button>
        </div>
      ) : comments.length === 0 ? (
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
                canInteract={canInteract}
                onDeleted={(id, removedCount) => {
                  setComments((prev) => prev.filter((x) => x.id !== id));
                  onCountChange?.(-removedCount);
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
