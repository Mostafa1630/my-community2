"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, ArrowRight, Lock } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { FeedPost, ReactionType } from "@/lib/api-types";
import { dir } from "@/lib/i18n/config";
import { reactionFailureMessage, userFacingApiError, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useCommunitySubscription, invalidateCommunityAccess } from "@/lib/use-details-access";
import { useToast } from "@/components/ToastProvider";
import PostCard from "./feed/PostCard";
import CommentsPanel from "./feed/CommentsPanel";
import ReactionsPanel from "./feed/ReactionsPanel";
import { FEED_COLUMN_CLASS } from "./CommunityFeedHeader";
import PageLoader from "./PageLoader";
import EmptyState from "./EmptyState";

export default function RealPostDetailView({
  postId,
  communityId,
  creatorId,
  communityType,
  initialTab,
  locale,
  dict
}: {
  postId: string;
  communityId: string;
  creatorId: string;
  communityType: "public" | "private";
  initialTab: "comments" | "reactions";
  locale: Locale;
  dict: Dictionary;
}) {
  const router = useRouter();
  const {
    user,
    apiUser,
    role,
    hydrated,
    sessionReady,
    myAccessLoaded,
    isSubscribed,
    getPost,
    updatePost,
    deletePost,
    togglePinPost,
    addReaction,
    removeReaction
  } = useAuth();
  const { confirm, showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [post, setPost] = useState<FeedPost | null>(null);
  const [postAccessGranted, setPostAccessGranted] = useState<boolean | null>(null);
  const [tab, setTab] = useState<"comments" | "reactions">(initialTab);
  const BackIcon = dir(locale) === "rtl" ? ArrowRight : ArrowLeft;

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
    postAccessGranted === null;

  const accessPending =
    communityType === "private" &&
    !isCommunityCreator &&
    role !== "admin" &&
    (membershipPending || probePending);

  const hasFeedAccess = subscribed || postAccessGranted === true;

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
      !sessionReady ||
      !myAccessLoaded ||
      !subscriptionResolved ||
      subscribed
    ) {
      setPostAccessGranted(null);
      return;
    }

    let cancelled = false;
    setPostAccessGranted(null);

    getPost(postId, locale)
      .then(() => {
        if (!cancelled) {
          setPostAccessGranted(true);
          invalidateCommunityAccess(communityId, locale);
        }
      })
      .catch(() => {
        if (!cancelled) setPostAccessGranted(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    communityType,
    isCommunityCreator,
    role,
    hydrated,
    sessionReady,
    myAccessLoaded,
    subscriptionResolved,
    subscribed,
    postId,
    communityId,
    locale,
    getPost,
  ]);

  const refreshPost = useCallback(async () => {
    const p = await getPost(postId, locale);
    setPost(p);
    setLoadError("");
  }, [getPost, postId, locale]);

  useEffect(() => {
    function syncTabFromHash() {
      const hash = window.location.hash;
      if (hash === "#post-reactions") setTab("reactions");
      else if (hash === "#post-comments") setTab("comments");
    }
    syncTabFromHash();
    window.addEventListener("hashchange", syncTabFromHash);
    return () => window.removeEventListener("hashchange", syncTabFromHash);
  }, []);

  useEffect(() => {
    if (!hydrated || !sessionReady) return;
    if (locked || accessPending) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError("");
    getPost(postId, locale)
      .then((p) => {
        if (cancelled) return;
        setPost(p);
      })
      .catch((err) => {
        if (cancelled) return;
        setPost(null);
        setLoadError(
          err instanceof ApiError && err.status === 404
            ? dict.community.postNotFound
            : dict.community.postLoadError,
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [postId, locale, locked, accessPending, hydrated, sessionReady, getPost, dict.community.postLoadError, dict.community.postNotFound]);

  if (!hydrated || !sessionReady || accessPending) return <PageLoader />;
  if (locked) {
    return (
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
    );
  }
  if (loading) return <PageLoader />;
  if (loadError) return <EmptyState icon={AlertCircle} title={loadError} />;
  if (!post) return <EmptyState icon={AlertCircle} title={dict.community.postNotFound} />;

  async function handleReact(type: ReactionType): Promise<string | void> {
    const prevReaction = post!.myReaction;
    const prevCount = post!.reactionsCount;
    setPost((p) =>
      p ? { ...p, myReaction: type, reactionsCount: p.myReaction ? p.reactionsCount : p.reactionsCount + 1 } : p
    );
    const result = await addReaction(postId, type, locale);
    if (!result.ok) {
      setPost((p) => (p ? { ...p, myReaction: prevReaction, reactionsCount: prevCount } : p));
      return reactionFailureMessage(result, dict.community.reactionError, {
        loginRequired: dict.community.loginRequired,
        subscriptionRequired: dict.community.subscriptionRequired,
      });
    }
  }

  async function handleRemoveReaction(): Promise<string | void> {
    const prevReaction = post!.myReaction;
    const prevCount = post!.reactionsCount;
    setPost((p) => (p ? { ...p, myReaction: null, reactionsCount: Math.max(0, p.reactionsCount - 1) } : p));
    const result = await removeReaction(postId, locale);
    if (!result.ok) {
      setPost((p) => (p ? { ...p, myReaction: prevReaction, reactionsCount: prevCount } : p));
      return reactionFailureMessage(result, dict.community.reactionError, {
        loginRequired: dict.community.loginRequired,
        subscriptionRequired: dict.community.subscriptionRequired,
      });
    }
  }

  async function handleEdit(payload: { content: string; newMedia: File[]; removedMediaUrls: string[] }) {
    try {
      const message = await updatePost(
        postId,
        {
          content: payload.content,
          media: payload.newMedia.length > 0 ? payload.newMedia : undefined,
          removedMediaUrls:
            payload.removedMediaUrls.length > 0 ? payload.removedMediaUrls : undefined,
        },
        locale,
      );
      showToast(message || dict.common.save, { variant: "success" });
      await refreshPost();
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

  function handleDelete() {
    confirm({
      message: dict.community.deleteConfirm,
      confirmLabel: dict.community.deletePost,
      cancelLabel: dict.common.cancel,
      onConfirm: async () => {
        try {
          await deletePost(postId, locale);
          showToast(dict.community.deleteSuccess, { variant: "success" });
          router.back();
        } catch {
          showToast(dict.community.deleteError, { variant: "error" });
        }
      },
    });
  }

  async function handleTogglePin() {
    try {
      await togglePinPost(postId, locale);
      await refreshPost();
    } catch (err) {
      showToast(
        err instanceof ApiError && err.message !== "An error occurred"
          ? err.message
          : dict.community.pinToggleError,
        { variant: "error" },
      );
    }
  }

  return (
    <div className={FEED_COLUMN_CLASS}>
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
      >
        <BackIcon size={16} />
        {dict.community.backToPost}
      </button>

      <PostCard
        post={post}
        locale={locale}
        dict={dict}
        communityId={communityId}
        isCommunityCreator={isCommunityCreator}
        canInteract={canInteract}
        onReact={handleReact}
        onRemoveReaction={handleRemoveReaction}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onTogglePin={handleTogglePin}
        detailMode
        variant="feed"
      />

      <div className="relative mt-4">
        <span id="post-comments" className="pointer-events-none absolute -top-24" aria-hidden />
        <span id="post-reactions" className="pointer-events-none absolute -top-24" aria-hidden />
        <div id="post-discussion">
          <div className="flex items-center gap-1 rounded-full border border-line bg-surface p-1">
            <button
              onClick={() => setTab("comments")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === "comments" ? "bg-primary-500 text-white" : "text-ink/65 hover:bg-paper"
              }`}
            >
              {dict.community.tabComments} ({post.commentsCount})
            </button>
            <button
              onClick={() => setTab("reactions")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === "reactions" ? "bg-primary-500 text-white" : "text-ink/65 hover:bg-paper"
              }`}
            >
              {dict.community.tabReactions} ({post.reactionsCount})
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5">
            {tab === "comments" ? (
              <CommentsPanel
                postId={postId}
                locale={locale}
                dict={dict}
                canModerate={isCommunityCreator || post.isOwner}
                canInteract={canInteract}
                initialComments={post.comments}
                onCountChange={(delta) =>
                  setPost((p) => (p ? { ...p, commentsCount: Math.max(0, p.commentsCount + delta) } : p))
                }
              />
            ) : (
              <ReactionsPanel postId={postId} locale={locale} dict={dict} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
