"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, ArrowRight, Lock } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { FeedPost, ReactionType } from "@/lib/api-types";
import { dir } from "@/lib/i18n/config";
import { useAuth } from "@/lib/auth-context";
import PostCard from "./feed/PostCard";
import CommentsPanel from "./feed/CommentsPanel";
import ReactionsPanel from "./feed/ReactionsPanel";
import PageLoader from "./PageLoader";
import EmptyState from "./EmptyState";

// The Facebook-style "open a post" detail page: the post itself (reaction
// counts always visible, regardless of which tab is open — per the client's
// explicit ask), then a Comments/Reactions tab pair styled like the navbar's
// own active-pill treatment, below it.
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
  // Same reasoning as RealCommunityFeedView — GET /posts/{id} isn't gated by
  // membership either, so a private community's post has to be hidden
  // client-side for anyone who isn't its creator/an admin.
  communityType: "public" | "private";
  initialTab: "comments" | "reactions";
  locale: Locale;
  dict: Dictionary;
}) {
  const router = useRouter();
  const { user, role, hydrated, getPost, updatePost, deletePost, togglePinPost, addReaction, removeReaction } =
    useAuth();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<FeedPost | null>(null);
  const [tab, setTab] = useState<"comments" | "reactions">(initialTab);
  const BackIcon = dir(locale) === "rtl" ? ArrowRight : ArrowLeft;

  const isCommunityCreator = role === "creator" && user?.id === creatorId;
  const locked = communityType === "private" && !isCommunityCreator && role !== "admin";

  useEffect(() => {
    // Same reasoning as RealCommunityFeedView — wait for the real session
    // to be confirmed before deciding "locked" or fetching.
    if (!hydrated) return;
    if (locked) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getPost(postId, locale)
      .then((p) => {
        if (!cancelled) setPost(p);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, locale, locked, hydrated]);

  if (loading) return <PageLoader />;
  if (locked) return <EmptyState icon={Lock} title={dict.creator.communityLocked} />;
  if (!post) return <EmptyState icon={AlertCircle} title={dict.common.empty} />;

  async function handleReact(type: ReactionType) {
    const prevReaction = post!.myReaction;
    const prevCount = post!.reactionsCount;
    setPost((p) =>
      p ? { ...p, myReaction: type, reactionsCount: p.myReaction ? p.reactionsCount : p.reactionsCount + 1 } : p
    );
    try {
      await addReaction(postId, type, locale);
    } catch (err) {
      setPost((p) => (p ? { ...p, myReaction: prevReaction, reactionsCount: prevCount } : p));
      throw err;
    }
  }

  async function handleRemoveReaction() {
    const prevReaction = post!.myReaction;
    const prevCount = post!.reactionsCount;
    setPost((p) => (p ? { ...p, myReaction: null, reactionsCount: Math.max(0, p.reactionsCount - 1) } : p));
    try {
      await removeReaction(postId, locale);
    } catch (err) {
      setPost((p) => (p ? { ...p, myReaction: prevReaction, reactionsCount: prevCount } : p));
      throw err;
    }
  }

  async function handleEdit(content: string, media: File[]) {
    await updatePost(postId, { content, media }, locale);
    setPost(await getPost(postId, locale));
  }

  async function handleDelete() {
    if (!window.confirm(dict.community.deleteConfirm)) return;
    await deletePost(postId, locale);
    router.back();
  }

  async function handleTogglePin() {
    await togglePinPost(postId, locale);
    setPost(await getPost(postId, locale));
  }

  return (
    <div className="mx-auto max-w-2xl">
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
        onReact={handleReact}
        onRemoveReaction={handleRemoveReaction}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onTogglePin={handleTogglePin}
        detailMode
        // Any signed-in visitor sees the reaction control, even just
        // previewing via "Explore community" without a real subscription —
        // the backend's own 403 message shows inline if they actually try,
        // rather than hiding the control outright.
        canInteract={!!user}
      />

      <div className="mt-4 flex items-center gap-1 rounded-full border border-line bg-surface p-1">
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
            canInteract={!!user}
          />
        ) : (
          <ReactionsPanel postId={postId} locale={locale} dict={dict} />
        )}
      </div>
    </div>
  );
}
