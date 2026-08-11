"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Download,
  FileText,
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
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import ReactionPicker from "./ReactionPicker";
import PostComposer from "./PostComposer";

// Shared between the feed list (compact, links out to the detail page for
// comments/reactions) and the detail page itself (detailMode — same card,
// minus the outbound link since the comments/reactions are already right
// below it there).
export default function PostCard({
  post,
  locale,
  dict,
  communityId,
  isCommunityCreator,
  onReact,
  onRemoveReaction,
  onEdit,
  onDelete,
  onTogglePin,
  detailMode = false,
  canInteract = true,
}: {
  post: FeedPost;
  locale: Locale;
  dict: Dictionary;
  communityId: string;
  isCommunityCreator: boolean;
  onReact: (type: ReactionType) => Promise<void>;
  onRemoveReaction: () => Promise<void>;
  onEdit: (content: string, media: File[]) => Promise<void>;
  onDelete: () => void;
  onTogglePin: () => void;
  detailMode?: boolean;
  // False for someone previewing a public community's feed without a real
  // subscription (the "Explore community" flow) — the backend still enforces
  // this with a 403 on react/comment, but hiding the controls up front reads
  // as "you're browsing, not a member" rather than a raw error after tapping.
  canInteract?: boolean;
}) {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [reactionError, setReactionError] = useState("");

  async function handleReact(type: ReactionType) {
    setReactionError("");
    try {
      await onReact(type);
    } catch (err) {
      setReactionError(err instanceof ApiError ? err.message : dict.community.reactionError);
    }
  }

  async function handleRemoveReaction() {
    setReactionError("");
    try {
      await onRemoveReaction();
    } catch (err) {
      setReactionError(err instanceof ApiError ? err.message : dict.community.reactionError);
    }
  }

  // Per the client's own rule: the post's author can edit or delete it; the
  // community's own creator can delete or pin any post, but not edit one
  // that isn't theirs.
  //
  // `post.isOwner` alone isn't trustworthy here — GET /communities/{id}/posts
  // (the list endpoint this feed loads from) was confirmed live to always
  // return is_owner: false, even for the exact user who just created the
  // post (GET /posts/{id}, the single-post endpoint, gets it right). Cross-
  // checking against the post's own author id fixes the list case without
  // affecting the already-correct detail-page case.
  const isOwner = post.isOwner || post.user.id === user?.id;
  const canEdit = isOwner;
  const canDelete = isOwner || isCommunityCreator;
  const canPin = isCommunityCreator;
  const hasMenu = canEdit || canDelete || canPin;

  if (editing) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5">
        <PostComposer
          dict={dict}
          initialContent={post.content}
          submitLabel={dict.common.save}
          placeholder=""
          onCancel={() => setEditing(false)}
          onSubmit={async (content, media) => {
            await onEdit(content, media);
            setEditing(false);
          }}
        />
      </div>
    );
  }

  const detailHref = `/${locale}/communities/${communityId}/posts/${post.id}`;

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
          className="absolute inset-0 z-0 rounded-2xl"
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

        {hasMenu && (
          <div className="relative z-10">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-full p-1.5 text-ink/65 hover:bg-ink/5"
              aria-label="options"
            >
              <MoreHorizontal size={18} />
            </button>
            {menuOpen && (
              <div
                className="absolute end-0 top-9 z-10 w-44 rounded-xl border border-line bg-surface p-1.5 shadow-raised"
                onMouseLeave={() => setMenuOpen(false)}
              >
                {canPin && (
                  <button
                    onClick={() => {
                      onTogglePin();
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start text-sm text-ink/80 hover:bg-primary-50"
                  >
                    {post.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                    {post.isPinned
                      ? dict.community.unpinPost
                      : dict.community.pinPost}
                  </button>
                )}
                {canEdit && (
                  <button
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
        )}
      </div>

      {post.content && (
        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-ink/80">
          {post.content}
        </p>
      )}

      {post.media.length > 0 && (
        <div
          className={`relative z-10 mt-3 grid gap-2 ${post.media.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
        >
          {post.media.map((m, i) => {
            if (/\.(mp4|mov)(\?.*)?$/i.test(m.url)) {
              return <video key={i} src={m.url} controls className="max-h-96 w-full rounded-xl object-cover" />;
            }
            if (/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(m.url)) {
              return (
                <img
                  key={i}
                  src={m.url}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="max-h-96 w-full rounded-xl object-cover"
                />
              );
            }
            return (
              <a
                key={i}
                href={m.url}
                target="_blank"
                rel="noreferrer"
                download
                className="flex items-center gap-2.5 rounded-xl border border-line bg-paper px-4 py-3 text-sm hover:border-primary-200"
              >
                <FileText size={16} className="shrink-0 text-primary-600" />
                <span className="min-w-0 flex-1 truncate text-ink">{m.url.split("/").pop()}</span>
                <Download size={14} className="shrink-0 text-ink/50" />
              </a>
            );
          })}
        </div>
      )}

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
      {reactionError && <p className="mt-1.5 text-xs text-danger">{reactionError}</p>}
    </article>
  );
}
