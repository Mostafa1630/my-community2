"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, Lock, MessageCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { FeedPost, ReactionType } from "@/lib/api-types";
import { reactionFailureMessage, ApiError, userFacingApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useCommunitySubscription, invalidateCommunityAccess } from "@/lib/use-details-access";
import { useToast } from "@/components/ToastProvider";
import PostComposer from "./feed/PostComposer";
import PostCard from "./feed/PostCard";
import CommunityMembersStrip from "./CommunityMembersStrip";
import { FEED_COLUMN_CLASS } from "./CommunityFeedHeader";
import EmptyState from "./EmptyState";
import PageLoader from "./PageLoader";

const POSTS_CACHE_PREFIX = "mujtamaaty.communityFeedPosts.v1:";

function postsCacheKey(communityId: string, locale: Locale) {
  return `${communityId}:${locale}`;
}

function readCachedPosts(key: string): FeedPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(POSTS_CACHE_PREFIX + key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FeedPost[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCachedPosts(key: string, posts: FeedPost[]) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(POSTS_CACHE_PREFIX + key, JSON.stringify(posts));
  } catch {

  }
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}


export default function RealCommunityFeedView({
  communityId,
  creatorId,
  communityType,
  locale,
  dict,
}: {
  communityId: string;
  creatorId: string;

  communityType: "public" | "private";
  locale: Locale;
  dict: Dictionary;
}) {
  const {
    user,
    apiUser,
    role,
    hydrated,
    myAccessLoaded,
    isSubscribed,
    getCommunityPosts,
    createCommunityPost,
    updatePost,
    deletePost,
    togglePinPost,
    addReaction,
    removeReaction
  } = useAuth();
  const { confirm, showToast } = useToast();
  const postsKey = postsCacheKey(communityId, locale);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [postsAccessGranted, setPostsAccessGranted] = useState<boolean | null>(null);
  const fetchGenRef = useRef(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { subscribed, resolved: subscriptionResolved } = useCommunitySubscription(communityId, locale);
  const membershipCached = role === "student" && isSubscribed(communityId);

  const isCommunityCreator =
    (role === "creator" && user?.id === creatorId) ||
    (apiUser?.type === "creator" && String(apiUser.id) === creatorId);

  const membershipPending =
    role === "student" &&
    (!myAccessLoaded || (!subscriptionResolved && !membershipCached));

  const probePending =
    communityType === "private" &&
    !isCommunityCreator &&
    role !== "admin" &&
    role === "student" &&
    myAccessLoaded &&
    subscriptionResolved &&
    !subscribed &&
    !membershipCached &&
    posts.length === 0 &&
    postsAccessGranted === null;

  const accessPending =
    communityType === "private" &&
    !isCommunityCreator &&
    role !== "admin" &&
    !membershipCached &&
    posts.length === 0 &&
    (membershipPending || probePending);

  const hasFeedAccess = subscribed || postsAccessGranted === true;

  const locked =
    communityType === "private" &&
    !isCommunityCreator &&
    role !== "admin" &&
    !accessPending &&
    !hasFeedAccess;

  const canInteract =
    isCommunityCreator || role === "admin" || (role === "student" && hasFeedAccess);


  useEffect(() => {
    if (
      communityType !== "private" ||
      isCommunityCreator ||
      role === "admin" ||
      role !== "student" ||
      !hydrated ||
      !myAccessLoaded ||
      !subscriptionResolved ||
      subscribed
    ) {
      setPostsAccessGranted(null);
      return;
    }

    let cancelled = false;
    setPostsAccessGranted(null);

    getCommunityPosts(communityId, locale, 1)
      .then(() => {
        if (!cancelled) {
          setPostsAccessGranted(true);
          invalidateCommunityAccess(communityId, locale);
        }
      })
      .catch(() => {
        if (!cancelled) setPostsAccessGranted(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    communityType,
    isCommunityCreator,
    role,
    hydrated,
    myAccessLoaded,
    subscriptionResolved,
    subscribed,
    communityId,
    locale,
    getCommunityPosts,
  ]);

  const sortPosts = useCallback(
    (items: FeedPost[]) =>
      [...items].sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }),
    []
  );

  const reload = useCallback(async () => {
    const fetchGen = ++fetchGenRef.current;
    const maxAttempts = 3;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const res = await getCommunityPosts(communityId, locale, 1);
        if (fetchGen !== fetchGenRef.current) return;
        const nextPosts = sortPosts(res.items);
        writeCachedPosts(postsKey, nextPosts);
        setPosts(nextPosts);
        setPage(1);
        setHasMore(res.currentPage < res.lastPage);
        setLoadError("");
        return;
      } catch (err) {
        if (fetchGen !== fetchGenRef.current) return;
        if (attempt < maxAttempts - 1) {
          await delay(350 * (attempt + 1));
          continue;
        }
        const cached = readCachedPosts(postsKey);
        if (cached.length > 0) {
          setPosts(cached);
          setLoadError("");
          return;
        }
        const message =
          err instanceof ApiError && err.status < 500 && err.message !== "An error occurred"
            ? err.message
            : dict.community.feedLoadError;
        setLoadError(message);
      }
    }
  }, [
    communityId,
    locale,
    postsKey,
    getCommunityPosts,
    sortPosts,
    dict.community.feedLoadError,
  ]);

  useEffect(() => {
    if (!hydrated) return;
    if (locked || accessPending) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const cached = readCachedPosts(postsKey);
    if (cached.length > 0) {
      setPosts(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }
    reload().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
      fetchGenRef.current += 1;
    };
  }, [communityId, locale, locked, accessPending, hydrated, postsKey, reload]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await getCommunityPosts(communityId, locale, nextPage);
      setPosts((prev) => sortPosts([...prev, ...res.items]));
      setPage(nextPage);
      setHasMore(res.currentPage < res.lastPage);
    } catch {
      showToast(dict.community.loadMoreError, { variant: "error" });
    } finally {
      setLoadingMore(false);
    }
  }, [communityId, locale, page, hasMore, loadingMore, getCommunityPosts, sortPosts, showToast, dict.community.loadMoreError]);

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

  async function handleCreate({ content, newMedia }: { content: string; newMedia: File[] }) {
    try {
      const message = await createCommunityPost(
        communityId,
        { content, media: newMedia.length > 0 ? newMedia : undefined },
        locale,
      );
      showToast(message || dict.common.post, { variant: "success" });
      try {
        await reload();
      } catch {
    
      }
    } catch (err) {
      showToast(
        userFacingApiError(err, dict.community.postCreateError, {
          loginRequired: dict.community.loginRequired,
          subscriptionRequired: dict.community.subscriptionRequired,
        }),
        { variant: "error" },
      );
    }
  }

  async function handleReact(post: FeedPost, type: ReactionType): Promise<string | void> {
    const prevReaction = post.myReaction;
    const prevCount = post.reactionsCount;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? { ...p, myReaction: type, reactionsCount: p.myReaction ? p.reactionsCount : p.reactionsCount + 1 }
          : p
      )
    );
    const result = await addReaction(post.id, type, locale);
    if (!result.ok) {
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, myReaction: prevReaction, reactionsCount: prevCount } : p))
      );
      return reactionFailureMessage(result, dict.community.reactionError, {
        loginRequired: dict.community.loginRequired,
        subscriptionRequired: dict.community.subscriptionRequired,
      });
    }
  }

  async function handleRemoveReaction(post: FeedPost): Promise<string | void> {
    const prevReaction = post.myReaction;
    const prevCount = post.reactionsCount;
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, myReaction: null, reactionsCount: Math.max(0, p.reactionsCount - 1) } : p))
    );
    const result = await removeReaction(post.id, locale);
    if (!result.ok) {
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, myReaction: prevReaction, reactionsCount: prevCount } : p))
      );
      return reactionFailureMessage(result, dict.community.reactionError, {
        loginRequired: dict.community.loginRequired,
        subscriptionRequired: dict.community.subscriptionRequired,
      });
    }
  }

  async function handleEdit(
    post: FeedPost,
    payload: { content: string; newMedia: File[]; removedMediaUrls: string[] },
  ) {
    try {
      const message = await updatePost(
        post.id,
        {
          content: payload.content,
          media: payload.newMedia.length > 0 ? payload.newMedia : undefined,
          removedMediaUrls:
            payload.removedMediaUrls.length > 0 ? payload.removedMediaUrls : undefined,
        },
        locale,
      );
      showToast(message || dict.common.save, { variant: "success" });
      try {
        await reload();
      } catch {
       
      }
    } catch (err) {
      showToast(
        userFacingApiError(err, dict.community.editError, {
          loginRequired: dict.community.loginRequired,
          subscriptionRequired: dict.community.subscriptionRequired,
        }),
        { variant: "error" },
      );
    }
  }

  function handleDelete(post: FeedPost) {
    confirm({
      message: dict.community.deleteConfirm,
      confirmLabel: dict.community.deletePost,
      cancelLabel: dict.common.cancel,
      onConfirm: async () => {
        const index = posts.findIndex((p) => p.id === post.id);
        setPosts((prev) => prev.filter((p) => p.id !== post.id));
        try {
          await deletePost(post.id, locale);
          showToast(dict.community.deleteSuccess, { variant: "success" });
        } catch {
          setPosts((prev) => {
            const next = [...prev];
            next.splice(Math.min(index < 0 ? next.length : index, next.length), 0, post);
            return sortPosts(next);
          });
          showToast(dict.community.deleteError, { variant: "error" });
        }
      },
    });
  }

  async function handleTogglePin(post: FeedPost) {
    try {
      await togglePinPost(post.id, locale);
      try {
        await reload();
      } catch {
        
      }
    } catch (err) {
      showToast(
        err instanceof ApiError && err.message !== "An error occurred"
          ? err.message
          : dict.community.pinToggleError,
        { variant: "error" },
      );
    }
  }

  const showMembersStrip =
    isCommunityCreator ||
    role === "admin" ||
    (role === "student" && (subscribed || membershipCached));

  if (accessPending) {
    return (
      <div className={FEED_COLUMN_CLASS}>
        <PageLoader />
      </div>
    );
  }

  if (locked) {
    return (
      <div className={FEED_COLUMN_CLASS}>
        <EmptyState
          icon={Lock}
          title={dict.creator.communityLocked}
          action={
            role === "guest" ? (
              <Link
                href={`/${locale}/login`}
                className="inline-flex items-center justify-center rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-600"
              >
                {dict.auth.loginTitle}
              </Link>
            ) : role === "student" ? (
              <Link
                href={`/${locale}/communities/${communityId}`}
                className="inline-flex items-center justify-center rounded-full bg-accent-500 px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-accent-400"
              >
                {dict.communityDetails.subscribeNow}
              </Link>
            ) : undefined
          }
        />
      </div>
    );
  }

  const feedBody = (
    <>
      {showMembersStrip && (
        <CommunityMembersStrip
          communityId={communityId}
          locale={locale}
          dict={dict}
          title={dict.creatorDash.activeMembersTitle}
        />
      )}

      {communityType === "public" && !canInteract && (
        <p className="rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink/70">
          {dict.community.subscriptionRequired}
        </p>
      )}

      {canInteract && (
        <section className="rounded-xl border border-line bg-surface px-4 py-3.5 sm:px-5 sm:py-4">
          <PostComposer
            dict={dict}
            submitLabel={dict.common.post}
            placeholder={dict.community.postPlaceholder}
            onSubmit={handleCreate}
            variant="feed"
          />
        </section>
      )}

      {loadError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>
      )}

      {loading && posts.length === 0 ? (
        <div className="space-y-4">
          <div className="h-64 animate-pulse rounded-xl bg-line/50" />
          <div className="h-64 animate-pulse rounded-xl bg-line/40" />
        </div>
      ) : posts.length === 0 && !loadError ? (
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
              canInteract={canInteract}
              onReact={(type) => handleReact(post, type)}
              onRemoveReaction={() => handleRemoveReaction(post)}
              onEdit={(payload) => handleEdit(post, payload)}
              onDelete={() => handleDelete(post)}
              onTogglePin={() => handleTogglePin(post)}
              variant="feed"
            />
          ))}
          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-4">
              {loadingMore && <Loader2 size={20} className="animate-spin text-primary-500" />}
            </div>
          )}
        </>
      )}
    </>
  );

  return <div className={`${FEED_COLUMN_CLASS} space-y-5`}>{feedBody}</div>;
}
