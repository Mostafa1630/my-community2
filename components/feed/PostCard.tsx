"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
  Trash2,
} from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { FeedPost, ReactionType } from "@/lib/api-types";
import { t } from "@/lib/i18n/t";
import { useAuth } from "@/lib/auth-context";
import { ApiError, resolveInteractionGateMessage } from "@/lib/api-client";
import { useToast } from "@/components/ToastProvider";
import ReactionPicker from "./ReactionPicker";
import PostComposer from "./PostComposer";
import FeedCommentPreview from "./FeedCommentPreview";
import PostMediaGallery from "./PostMediaGallery";


export default function PostCard({
  post,
  locale,
  dict,
  communityId,
  isCommunityCreator,
  canInteract = true,
  onReact,
  onRemoveReaction,
  onEdit,
  onDelete,
  onTogglePin,
  detailMode = false,
  variant = "default",
}: {
  post: FeedPost;
  locale: Locale;
  dict: Dictionary;
  communityId: string;
  isCommunityCreator: boolean;
  canInteract?: boolean;
  // Resolves to an error message on failure — callers return a string rather
  // than throwing so a failed react never becomes an unhandled rejection in
  // the picker/PostCard click path (Next.js dev overlay was surfacing those).
  onReact: (type: ReactionType) => Promise<string | void>;
  onRemoveReaction: () => Promise<string | void>;
  onEdit: (payload: { content: string; newMedia: File[]; removedMediaUrls: string[] }) => Promise<void>;
  onDelete: () => void;
  onTogglePin: () => void;
  detailMode?: boolean;
  variant?: "default" | "feed";
}) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (menuRef.current?.contains(event.target as Node)) return;
      setMenuOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [menuOpen]);

  const interactionGates = {
    loginRequired: dict.community.loginRequired,
    subscriptionRequired: dict.community.subscriptionRequired,
  };

  function reactionFailureMessage(err: unknown): string {
    if (err instanceof ApiError) {
      const gateMessage = resolveInteractionGateMessage(err.status, err.message, interactionGates);
      if (gateMessage) return gateMessage;
      // Laravel's generic 500 copy isn't actionable — show our own string.
      if (err.status >= 500 || err.message === "An error occurred") {
        return dict.community.reactionError;
      }
      return err.message;
    }
    return dict.community.reactionError;
  }

  function gateMessageFromText(message: string): string {
    return (
      resolveInteractionGateMessage(0, message, interactionGates) ?? message
    );
  }

  function showReactionError(message: string) {
    showToast(gateMessageFromText(message), { variant: "error" });
  }

  async function handleReact(type: ReactionType) {
    if (!user) {
      showToast(dict.community.loginRequired, { variant: "error" });
      return;
    }
    try {
      const message = await onReact(type);
      if (message) showReactionError(message);
    } catch (err) {
      showReactionError(reactionFailureMessage(err));
    }
  }

  async function handleRemoveReaction() {
    if (!user) {
      showToast(dict.community.loginRequired, { variant: "error" });
      return;
    }
    try {
      const message = await onRemoveReaction();
      if (message) showReactionError(message);
    } catch (err) {
      showReactionError(reactionFailureMessage(err));
    }
  }

  // Post author can edit/delete when subscribed; community creator always can.
  const isOwner = post.isOwner;
  const canEdit = isOwner && canInteract;
  const canDelete = (isOwner && canInteract) || isCommunityCreator;
  const canPin = isCommunityCreator;
  const hasMenu = canEdit || canDelete || canPin;

  if (editing) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5">
        <PostComposer
          dict={dict}
          initialContent={post.content}
          initialExistingMedia={post.media}
          submitLabel={dict.common.save}
          placeholder=""
          boxed
          onCancel={() => setEditing(false)}
          onSubmit={async (payload) => {
            await onEdit(payload);
            setEditing(false);
          }}
        />
      </div>
    );
  }

  const detailHref = `/${locale}/communities/${communityId}/posts/${post.id}`;
  const isFeed = variant === "feed";

  const optionsMenu = hasMenu ? (
    <div className="relative z-20 shrink-0" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen((v) => !v);
        }}
        className="rounded-full p-2 text-ink/55 hover:bg-paper"
        aria-label="options"
        aria-expanded={menuOpen}
      >
        <MoreHorizontal size={18} />
      </button>
      {menuOpen && (
        <div className="absolute end-0 top-full z-20 mt-1 w-44 rounded-xl border border-line bg-surface p-1.5 shadow-raised">
          {canPin && (
            <button
              type="button"
              onClick={() => {
                onTogglePin();
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start text-sm text-ink/80 hover:bg-primary-50"
            >
              {post.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
              {post.isPinned ? dict.community.unpinPost : dict.community.pinPost}
            </button>
          )}
          {canEdit && (
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start text-sm text-ink/80 hover:bg-primary-50"
            >
              <Pencil size={14} /> {dict.community.editPost}
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onDelete();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start text-sm text-danger hover:bg-danger/10"
            >
              <Trash2 size={14} /> {dict.community.deletePost}
            </button>
          )}
        </div>
      )}
    </div>
  ) : null;

  if (isFeed) {
    const hasComments =
      !detailMode && (post.comments.length > 0 || post.commentsCount > post.comments.length);

    const headerInner = (
      <>
        <img
          src={post.user.profileImage || "/images/avatar-placeholder.jpg"}
          alt=""
          className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-line"
        />
        <div className="min-w-0 text-start">
          <p className="truncate text-sm font-semibold text-ink">{post.user.name}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0 text-xs text-ink/50">
            {post.isPinned && (
              <>
                <span className="inline-flex items-center gap-1 font-medium text-accent-700">
                  <Pin size={11} className="fill-accent-700" />
                  {dict.community.pinnedLabel}
                </span>
                <span aria-hidden>·</span>
              </>
            )}
            <span>{post.createdAt}</span>
          </div>
        </div>
      </>
    );

    return (
      <article
        className={`overflow-hidden rounded-2xl border bg-surface shadow-card ${
          post.isPinned ? "border-accent-300 ring-1 ring-accent-200/60" : "border-line"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-3.5">
          {detailMode ? (
            <div className="flex min-w-0 items-center gap-3">{headerInner}</div>
          ) : (
            <Link href={detailHref} className="flex min-w-0 items-center gap-3 hover:opacity-90">
              {headerInner}
            </Link>
          )}
          {optionsMenu}
        </div>

        {post.content && (
          <p className="px-5 pb-2 text-[0.9375rem] leading-7 text-ink/85 whitespace-pre-line">{post.content}</p>
        )}

        {post.media.length > 0 && <PostMediaGallery items={post.media} variant="feed" />}

        <div className="relative z-10 px-5 pb-3 pt-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-0.5">
              {canInteract ? (
                <>
                  <ReactionPicker
                    current={post.myReaction}
                    onReact={handleReact}
                    onRemove={handleRemoveReaction}
                    dict={dict}
                    iconOnly
                  />
                  {detailMode ? (
                    <a
                      href="#post-comments"
                      className="rounded-full p-2 text-ink/70 transition hover:bg-paper hover:text-ink"
                    >
                      <MessageCircle size={22} strokeWidth={1.75} />
                    </a>
                  ) : (
                    <Link
                      href={`${detailHref}?tab=comments`}
                      className="rounded-full p-2 text-ink/70 transition hover:bg-paper hover:text-ink"
                    >
                      <MessageCircle size={22} strokeWidth={1.75} />
                    </Link>
                  )}
                </>
              ) : null}
            </div>

            {(post.reactionsCount > 0 || post.commentsCount > 0) && (
              <div className="flex items-center gap-3 text-xs text-ink/50">
                {post.reactionsCount > 0 &&
                  (detailMode ? (
                    <a href="#post-reactions" className="hover:text-ink/70">
                      {t(dict.community.feedReactionsCount, { count: post.reactionsCount })}
                    </a>
                  ) : (
                    <Link href={`${detailHref}?tab=reactions`} className="hover:text-ink/70">
                      {t(dict.community.feedReactionsCount, { count: post.reactionsCount })}
                    </Link>
                  ))}
                {post.commentsCount > 0 &&
                  (detailMode ? (
                    <a href="#post-comments" className="hover:text-ink/70">
                      {t(dict.community.feedCommentsCount, { count: post.commentsCount })}
                    </a>
                  ) : (
                    <Link href={`${detailHref}?tab=comments`} className="hover:text-ink/70">
                      {t(dict.community.feedCommentsCount, { count: post.commentsCount })}
                    </Link>
                  ))}
              </div>
            )}
          </div>

          {hasComments && (
            <div className="mt-3">
              <FeedCommentPreview
                comments={post.comments}
                commentsCount={post.commentsCount}
                detailHref={detailHref}
                dict={dict}
              />
            </div>
          )}

        </div>
      </article>
    );
  }

  // Reactions count and comments count each jump straight to their own tab
  // on the detail page — clicking one shouldn't dump you on the other. Plain
  // outline heart here (no fill, inherits the row's neutral ink color) —
  // not the solid red heart emoji used inside the reaction picker itself,
  // since this is just a tally, not "your reaction".
  const countsRow = (
    <div className="flex items-center gap-4 text-xs text-ink/65">
      {post.reactionsCount > 0 &&
        (detailMode ? (
          <span className="flex items-center gap-1.5">
            <Heart size={13} /> {post.reactionsCount}
          </span>
        ) : (
          <Link
            href={`${detailHref}?tab=reactions`}
            className="relative z-10 flex items-center gap-1.5 hover:text-primary-700"
          >
            <Heart size={13} /> {post.reactionsCount}
          </Link>
        ))}
      {detailMode ? (
        <span className="flex items-center gap-1.5">
          <MessageCircle size={14} /> {post.commentsCount}
        </span>
      ) : (
        <Link
          href={`${detailHref}?tab=comments`}
          className="flex items-center gap-1.5 hover:text-primary-700"
        >
          <MessageCircle size={14} /> {post.commentsCount}
        </Link>
      )}
    </div>
  );

  return (
    <article
      className={`relative rounded-2xl border p-4 shadow-card sm:p-5 ${
        post.isPinned
          ? "border-accent-300 bg-accent-50/30"
          : "border-line bg-surface"
      }`}
    >
      {/* Stretched-link pattern: clicking anywhere on the post (not just the
          comments/reactions counts) opens its detail page, same as clicking
          those counts already did — sits under the interactive controls
          below (menu, reaction picker, the counts' own links), which each
          get position+z-index so they still intercept clicks over them. */}
      {!detailMode && (
        <Link
          href={detailHref}
          className="pointer-events-none absolute inset-0 z-0 rounded-2xl"
          aria-label={post.content || dict.community.viewPost}
        />
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <img
            src={post.user.profileImage || "/images/avatar-placeholder.jpg"}
            alt=""
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-semibold text-ink">{post.user.name}</p>
            <div className="flex items-center gap-1.5 text-xs text-ink/65">
              {post.isPinned && (
                <span className="flex items-center gap-1 font-medium text-accent-700">
                  <Pin size={11} className="fill-accent-700" />
                  {dict.community.pinnedLabel}
                  <span className="text-ink/40">·</span>
                </span>
              )}
              {post.createdAt}
            </div>
          </div>
        </div>

        {optionsMenu}
      </div>

      {post.content && (
        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-ink/80">{post.content}</p>
      )}

      {post.media.length > 0 && <PostMediaGallery items={post.media} variant="card" />}

      <div className="relative z-10 mt-3 flex items-center justify-between border-t border-line pt-3">
        {canInteract ? (
          <ReactionPicker
            current={post.myReaction}
            onReact={handleReact}
            onRemove={handleRemoveReaction}
            dict={dict}
          />
        ) : (
          <span />
        )}
        {countsRow}
      </div>
    </article>
  );
}
