"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { FeedReaction } from "@/lib/api-types";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ToastProvider";
import EmptyState from "../EmptyState";
import { REACTION_EMOJI, reactionLabel } from "./reactionConfig";


export default function ReactionsPanel({ postId, locale, dict }: { postId: string; locale: Locale; dict: Dictionary }) {
  const { getPostReactions, sessionReady, hydrated } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reactions, setReactions] = useState<FeedReaction[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadError, setLoadError] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hydrated || !sessionReady) return;

    let cancelled = false;
    setLoading(true);
    setLoadError("");
    getPostReactions(postId, locale, 1)
      .then((res) => {
        if (cancelled) return;
        setReactions(res.items);
        setPage(1);
        setHasMore(res.currentPage < res.lastPage);
      })
      .catch(() => {
        if (!cancelled) {
          setReactions([]);
          setLoadError(dict.community.reactionsLoadError);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
   
  }, [postId, locale, hydrated, sessionReady]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await getPostReactions(postId, locale, nextPage);
      setReactions((prev) => [...prev, ...res.items]);
      setPage(nextPage);
      setHasMore(res.currentPage < res.lastPage);
    } catch {
      showToast(dict.community.loadMoreError, { variant: "error" });
    } finally {
      setLoadingMore(false);
    }
  }, [postId, locale, page, hasMore, loadingMore, getPostReactions, showToast, dict.community.loadMoreError]);

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

  if (!sessionReady || loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 size={22} className="animate-spin text-primary-500" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>
    );
  }

  if (reactions.length === 0) {
    return <EmptyState icon={Heart} title={dict.community.noReactionsYet} />;
  }

  return (
    <div className="space-y-1">
      {reactions.map((r) => (
        <div key={r.id} className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-paper">
          <span className="relative shrink-0">
            <img
              src={r.user.profileImage || "/images/avatar-placeholder.jpg"}
              alt=""
              className="h-10 w-10 rounded-full object-cover"
            />
            <span className="absolute -bottom-1 -end-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-surface bg-surface text-xs">
              {REACTION_EMOJI[r.type]}
            </span>
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{r.user.name}</p>
            <p className="text-xs text-ink/55">
              {reactionLabel(r.type, dict)} · {r.createdAt}
            </p>
          </div>
        </div>
      ))}
      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-4">
          {loadingMore && <Loader2 size={18} className="animate-spin text-primary-500" />}
        </div>
      )}
    </div>
  );
}
