"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Lock, MessageCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { FeedPost, ReactionType } from "@/lib/api-types";
import { useAuth } from "@/lib/auth-context";
import PostComposer from "./feed/PostComposer";
import PostCard from "./feed/PostCard";
import EmptyState from "./EmptyState";
import PageLoader from "./PageLoader";

// Real backend feed — used both by the student-facing community feed page
// and the creator's own "Community feed" dashboard page, same as the old
// mock CommunityFeed component was. GET /communities/{id}/posts has no
// documented permission check (only 404 for a missing community), so the
// feed itself is shown to anyone who navigates here; only posting is
// gated client-side (for UX — the backend still enforces it with a 403).
//
// Loads page 1 up front, then an IntersectionObserver on a sentinel below
// the last post fetches the next page as it scrolls into view — an infinite
// scroll rather than upfront-loading every post in the community at once.
export default function RealCommunityFeedView({
  communityId,
  creatorId,
  communityType,
  locale,
  dict
}: {
  communityId: string;
  creatorId: string;
  // GET /communities/{id}/posts turned out to be wide open — no auth, no
  // membership check, for public AND private communities alike (confirmed
  // live). With no real subscribe endpoint yet either, there's no way to
  // know a student has actually paid for a private community, so the only
  // honest default is to never show a private community's feed to a
  // student at all — only the owning creator/an admin sees it, until a real
  // subscription check exists to gate this properly.
  communityType: "public" | "private";
  locale: Locale;
  dict: Dictionary;
}) {
  const { user, role, hydrated, getCommunityPosts, createCommunityPost, updatePost, deletePost, togglePinPost, addReaction, removeReaction } =
    useAuth();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const isCommunityCreator = role === "creator" && user?.id === creatorId;
  const canPost = role === "student" || isCommunityCreator;
  const locked = communityType === "private" && !isCommunityCreator && role !== "admin";

  const sortPosts = useCallback(
    (items: FeedPost[]) =>
      [...items].sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }),
    []
  );

  // Resets back to page 1 — used on first mount and after any action that
  // could change the list's shape (new post, delete, pin/unpin).
  const reload = useCallback(async () => {
    const res = await getCommunityPosts(communityId, locale, 1);
    setPosts(sortPosts(res.items));
    setPage(1);
    setHasMore(res.currentPage < res.lastPage);
  }, [communityId, locale, getCommunityPosts, sortPosts]);

  useEffect(() => {
    // Same reasoning as the review form / subscribe card fixes: `role`
    // (and therefore `locked`/`canPost`) isn't trustworthy until the real
    // session is confirmed — deciding "locked" or fetching posts off a
    // momentarily-guest `role` was the same bug class, just unguarded here
    // too. Keeps showing the loading spinner (not a wrong state) until then.
    if (!hydrated) return;
    if (locked) {
      setLoading(false);
      return;
    }
    setLoading(true);
    reload().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload, locked, hydrated]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await getCommunityPosts(communityId, locale, nextPage);
      setPosts((prev) => sortPosts([...prev, ...res.items]));
      setPage(nextPage);
      setHasMore(res.currentPage < res.lastPage);
    } finally {
      setLoadingMore(false);
    }
  }, [communityId, locale, page, hasMore, loadingMore, getCommunityPosts, sortPosts]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading, loadMore]);

  async function handleCreate(content: string, media: File[]) {
    await createCommunityPost(communityId, { content, media }, locale);
    await reload();
  }

  async function handleReact(post: FeedPost, type: ReactionType) {
    const prevReaction = post.myReaction;
    const prevCount = post.reactionsCount;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? { ...p, myReaction: type, reactionsCount: p.myReaction ? p.reactionsCount : p.reactionsCount + 1 }
          : p
      )
    );
    try {
      await addReaction(post.id, type, locale);
    } catch (err) {
      // Revert the optimistic update and rethrow so PostCard can show the
      // real reason (e.g. "Forbidden" for an unsubscribed student) inline,
      // same as post/comment submission errors.
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, myReaction: prevReaction, reactionsCount: prevCount } : p))
      );
      throw err;
    }
  }

  async function handleRemoveReaction(post: FeedPost) {
    const prevReaction = post.myReaction;
    const prevCount = post.reactionsCount;
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, myReaction: null, reactionsCount: Math.max(0, p.reactionsCount - 1) } : p))
    );
    try {
      await removeReaction(post.id, locale);
    } catch (err) {
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, myReaction: prevReaction, reactionsCount: prevCount } : p))
      );
      throw err;
    }
  }

  async function handleEdit(post: FeedPost, content: string, media: File[]) {
    await updatePost(post.id, { content, media }, locale);
    await reload();
  }

  async function handleDelete(post: FeedPost) {
    if (!window.confirm(dict.community.deleteConfirm)) return;
    await deletePost(post.id, locale);
    await reload();
  }

  async function handleTogglePin(post: FeedPost) {
    await togglePinPost(post.id, locale);
    await reload();
  }

  if (loading) return <PageLoader />;

  if (locked) {
    return (
      <div className="mx-auto max-w-2xl">
        <EmptyState icon={Lock} title={dict.creator.communityLocked} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {canPost && user && (
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5">
          <PostComposer
            dict={dict}
            submitLabel={dict.common.post}
            placeholder={dict.community.postPlaceholder}
            onSubmit={handleCreate}
          />
        </div>
      )}

      {posts.length === 0 ? (
        <EmptyState icon={MessageCircle} title={dict.community.noPosts} />
      ) : (
        <>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              locale={locale}
              dict={dict}
              communityId={communityId}
              isCommunityCreator={isCommunityCreator}
              onReact={(type) => handleReact(post, type)}
              onRemoveReaction={() => handleRemoveReaction(post)}
              onEdit={(content, media) => handleEdit(post, content, media)}
              onDelete={() => handleDelete(post)}
              onTogglePin={() => handleTogglePin(post)}
            />
          ))}
          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-4">
              {loadingMore && <Loader2 size={20} className="animate-spin text-primary-500" />}
            </div>
          )}
        </>
      )}
    </div>
  );
}
