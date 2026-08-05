"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  Send,
  Image as ImageIcon,
  Video,
  Paperclip,
  X,
  FileText,
  Download,
  Users,
  Pin,
  PinOff
} from "lucide-react";
import type { AccentKey, CommunityPost, Media, PostComment } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { t } from "@/lib/i18n/t";
import { useAuth } from "@/lib/auth-context";
import { usePlatformStore } from "@/lib/platform-store";
import { getUserById } from "@/lib/data";
import { getAccent, initials } from "@/lib/accents";
import { formatRelative, formatNumber } from "@/lib/format";
import EmptyState from "./EmptyState";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function PostAttachment({ media }: { media: Media }) {
  if (media.mimeType.startsWith("image/")) {
    return (
      <img
        src={media.filePath}
        alt={media.fileName}
        loading="lazy"
        decoding="async"
        className="mt-3 max-h-96 w-full rounded-xl object-cover"
      />
    );
  }
  if (media.mimeType.startsWith("video/")) {
    // eslint-disable-next-line jsx-a11y/media-has-caption
    return <video src={media.filePath} controls className="mt-3 max-h-96 w-full rounded-xl bg-black" />;
  }
  return (
    <a
      href={media.filePath}
      download={media.fileName}
      className="mt-3 flex items-center gap-3 rounded-xl border border-line bg-paper px-3 py-2.5 hover:border-primary-300"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
        <FileText size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-medium text-ink">{media.fileName}</span>
        <span className="block text-[11px] text-ink/65">{formatFileSize(media.size)}</span>
      </span>
      <Download size={14} className="shrink-0 text-ink/65" />
    </a>
  );
}

export default function CommunityFeed({
  communityId,
  locale,
  dict,
  creatorId
}: {
  communityId: string;
  locale: Locale;
  dict: Dictionary;
  creatorId: string;
}) {
  const { user, role } = useAuth();
  const store = usePlatformStore();
  const [draft, setDraft] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedPreview, setAttachedPreview] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isCreatorOfThisCommunity = role === "creator" && user?.id === creatorId;
  const canPost = role === "student" || isCreatorOfThisCommunity;

  const posts = useMemo(
    () =>
      store.posts.all
        .filter((p) => p.communityId === communityId)
        .sort((a, b) => {
          if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }),
    [store.posts.all, communityId]
  );

  const creatorMember = getUserById(creatorId);
  const activeMembers = useMemo(() => {
    const now = Date.now();
    const subscriberIds = Array.from(
      new Set(
        store.communitySubscriptions.all
          .filter(
            (s) => s.communityId === communityId && s.status === "active" && new Date(s.endsAt).getTime() > now
          )
          .map((s) => s.studentId)
      )
    );
    return subscriberIds
      .map((id) => getUserById(id))
      .filter((member): member is NonNullable<typeof member> => !!member);
  }, [store.communitySubscriptions.all, communityId]);

  function pickFile(file: File | undefined) {
    if (!file) return;
    if (attachedPreview) URL.revokeObjectURL(attachedPreview);
    setAttachedFile(file);
    setAttachedPreview(URL.createObjectURL(file));
  }

  function clearAttachment() {
    if (attachedPreview) URL.revokeObjectURL(attachedPreview);
    setAttachedFile(null);
    setAttachedPreview(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function submitPost() {
    if ((!draft.trim() && !attachedFile) || !user) return;
    const now = new Date().toISOString();
    const postId = `local-post-${Date.now()}`;
    const newPost: CommunityPost = {
      id: postId,
      communityId,
      userId: user.id,
      content: draft.trim(),
      createdAt: now,
      updatedAt: now
    };
    store.posts.add(newPost);
    if (attachedFile && attachedPreview) {
      store.media.add({
        id: `local-media-${Date.now()}`,
        mediableType: "post",
        mediableId: postId,
        collectionName: "post_attachment",
        filePath: attachedPreview,
        fileName: attachedFile.name,
        mimeType: attachedFile.type || "application/octet-stream",
        size: attachedFile.size,
        createdAt: now
      });
    }
    setDraft("");
    setAttachedFile(null);
    setAttachedPreview(null);
  }

  function saveEdit(id: string) {
    store.posts.update(id, { content: editDraft, updatedAt: new Date().toISOString() });
    setEditingId(null);
  }

  function removePost(id: string) {
    store.posts.remove(id);
    setOpenMenuId(null);
  }

  function togglePin(post: CommunityPost) {
    store.posts.update(post.id, { pinned: !post.pinned });
    setOpenMenuId(null);
  }

  function toggleLike(postId: string) {
    if (!user) return;
    const existing = store.reactions.all.find((r) => r.postId === postId && r.userId === user.id);
    if (existing) {
      store.reactions.remove(existing.id);
    } else {
      store.reactions.add({
        id: `local-react-${Date.now()}`,
        postId,
        userId: user.id,
        type: "like",
        createdAt: new Date().toISOString()
      });
    }
  }

  function addComment(postId: string, parentId: string | null) {
    const content = commentDraft[`${postId}:${parentId ?? "root"}`]?.trim();
    if (!content || !user) return;
    store.comments.add({
      id: `local-comment-${Date.now()}`,
      postId,
      userId: user.id,
      parentId,
      content,
      createdAt: new Date().toISOString()
    });
    setCommentDraft((prev) => ({ ...prev, [`${postId}:${parentId ?? "root"}`]: "" }));
    setReplyingTo(null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_290px] lg:items-start">
      <div className="min-w-0">
        {isCreatorOfThisCommunity && (
          <p className="mb-4 rounded-xl border border-accent-200 bg-accent-50 px-4 py-3 text-xs text-accent-800">
            {dict.community.moderationNote}
          </p>
        )}

        {canPost && user && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
            <div className="h-[3px] w-full bg-gradient-to-r from-accent-600 via-accent-400 to-accent-600" />

            <div className="p-5 sm:p-6">
              <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/65">
                {dict.community.composerTitle}
              </h2>

              <div className="flex items-start gap-3.5">
                <Avatar accent={user.avatarAccent} name={user.name} />
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={dict.community.postPlaceholder}
                  rows={2}
                  className="w-full resize-none border-0 border-b border-line bg-transparent px-0.5 py-2 text-[15px] leading-7 text-ink outline-none transition placeholder:text-ink/35 focus:border-ink/30"
                />
              </div>

              {attachedFile && attachedPreview && (
                <div className="mt-3 ms-[3.25rem]">
                  {attachedFile.type.startsWith("image/") ? (
                    <div className="relative inline-block">
                      <img src={attachedPreview} alt="" className="max-h-40 rounded-lg object-cover" />
                      <button
                        onClick={clearAttachment}
                        className="absolute -top-2 -end-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white"
                        aria-label="remove attachment"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : attachedFile.type.startsWith("video/") ? (
                    <div className="relative inline-block">
                      <video src={attachedPreview} className="max-h-40 rounded-lg bg-black" />
                      <button
                        onClick={clearAttachment}
                        className="absolute -top-2 -end-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white"
                        aria-label="remove attachment"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex max-w-xs items-center gap-2 rounded-lg border border-line px-3 py-2">
                      <FileText size={16} className="shrink-0 text-ink/65" />
                      <span className="min-w-0 flex-1 truncate text-xs text-ink">{attachedFile.name}</span>
                      <button onClick={clearAttachment} aria-label="remove attachment">
                        <X size={14} className="text-ink/65" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => pickFile(e.target.files?.[0])}
                  />
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => pickFile(e.target.files?.[0])}
                  />
                  <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => pickFile(e.target.files?.[0])} />
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    title={dict.community.attachImage}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-ink/65 transition hover:bg-paper hover:text-ink/70"
                  >
                    <ImageIcon size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    title={dict.community.attachVideo}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-ink/65 transition hover:bg-paper hover:text-ink/70"
                  >
                    <Video size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title={dict.community.attachFile}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-ink/65 transition hover:bg-paper hover:text-ink/70"
                  >
                    <Paperclip size={17} />
                  </button>
                </div>
                <button
                  onClick={submitPost}
                  disabled={!draft.trim() && !attachedFile}
                  className="rounded-full bg-ink px-6 py-2 text-sm font-semibold text-white transition hover:bg-ink/85 disabled:opacity-30"
                >
                  {dict.common.post}
                </button>
              </div>
            </div>
          </div>
        )}

        {posts.length === 0 ? (
          <EmptyState icon={MessageCircle} title={dict.community.noPosts} />
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {posts.map((post) => {
            const author = getUserById(post.userId);
            const canEdit = user?.id === post.userId;
            const canDelete = user?.id === post.userId || isCreatorOfThisCommunity;
            const postComments = store.comments.all.filter((c) => c.postId === post.id);
            const topLevel = postComments
              .filter((c) => c.parentId === null)
              .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            const reactions = store.reactions.all.filter((r) => r.postId === post.id);
            const liked = !!user && reactions.some((r) => r.userId === user.id);
            const attachment = store.media.all.find((m) => m.mediableType === "post" && m.mediableId === post.id);

            return (
              <motion.article
                key={post.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={`rounded-2xl border p-4 shadow-card ${
                  post.pinned ? "border-accent-300 bg-accent-50/30" : "border-line bg-surface"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar accent={author?.avatarAccent ?? "ink"} name={author?.name ?? ""} />
                    <div>
                      <p className="text-sm font-semibold text-ink">{author?.name}</p>
                      <div className="flex items-center gap-1.5 text-xs text-ink/65">
                        <AnimatePresence initial={false}>
                          {post.pinned && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0.6, width: 0 }}
                              animate={{ opacity: 1, scale: 1, width: "auto" }}
                              exit={{ opacity: 0, scale: 0.6, width: 0 }}
                              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                              className="flex items-center gap-1 overflow-hidden whitespace-nowrap font-medium text-accent-700"
                            >
                              <Pin size={11} className="fill-accent-700" />
                              {dict.community.pinnedLabel}
                              <span className="text-ink/65">·</span>
                            </motion.span>
                          )}
                        </AnimatePresence>
                        {formatRelative(post.createdAt, locale)}
                      </div>
                    </div>
                  </div>
                  {(canEdit || canDelete) && (
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === post.id ? null : post.id)}
                        className="rounded-full p-1.5 text-ink/65 hover:bg-ink/5"
                        aria-label="options"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                      {openMenuId === post.id && (
                        <div className="absolute end-0 top-9 z-10 w-44 rounded-xl border border-line bg-surface p-1.5 shadow-raised">
                          {isCreatorOfThisCommunity && (
                            <button
                              onClick={() => togglePin(post)}
                              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start text-sm text-ink/80 hover:bg-primary-50"
                            >
                              {post.pinned ? <PinOff size={14} /> : <Pin size={14} />}
                              {post.pinned ? dict.community.unpinPost : dict.community.pinPost}
                            </button>
                          )}
                          {canEdit && (
                            <button
                              onClick={() => {
                                setEditingId(post.id);
                                setEditDraft(post.content);
                                setOpenMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start text-sm text-ink/80 hover:bg-primary-50"
                            >
                              <Pencil size={14} /> {dict.community.editPost}
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => removePost(post.id)}
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

                {editingId === post.id ? (
                  <div className="mt-3">
                    <textarea
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      rows={2}
                      className="w-full resize-none rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-primary-400"
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded-full border border-line px-3 py-1 text-xs font-medium text-ink/65"
                      >
                        {dict.common.cancel}
                      </button>
                      <button
                        onClick={() => saveEdit(post.id)}
                        className="rounded-full bg-primary-500 px-3 py-1 text-xs font-medium text-white"
                      >
                        {dict.common.save}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {post.content && (
                      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-ink/80">{post.content}</p>
                    )}
                    {attachment && <PostAttachment media={attachment} />}
                  </>
                )}

                <div className="mt-3 flex items-center gap-4 border-t border-line pt-3 text-xs text-ink/65">
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1.5 hover:text-danger ${liked ? "text-danger" : ""}`}
                  >
                    <motion.span
                      className="flex"
                      animate={liked ? { scale: [1, 1.35, 1] } : { scale: 1 }}
                      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Heart size={14} className={liked ? "fill-danger" : ""} />
                    </motion.span>
                    {reactions.length}
                  </motion.button>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle size={14} /> {postComments.length}
                  </span>
                </div>

                {topLevel.length > 0 && (
                  <div className="mt-3 space-y-3 border-t border-line pt-3">
                    {topLevel.map((c) => (
                      <CommentThread
                        key={c.id}
                        comment={c}
                        allComments={postComments}
                        postId={post.id}
                        locale={locale}
                        dict={dict}
                        replyingTo={replyingTo}
                        setReplyingTo={setReplyingTo}
                        commentDraft={commentDraft}
                        setCommentDraft={setCommentDraft}
                        onReply={addComment}
                        canReply={!!user}
                      />
                    ))}
                  </div>
                )}

                {user && (
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      value={commentDraft[`${post.id}:root`] ?? ""}
                      onChange={(e) =>
                        setCommentDraft((prev) => ({ ...prev, [`${post.id}:root`]: e.target.value }))
                      }
                      onKeyDown={(e) => e.key === "Enter" && addComment(post.id, null)}
                      placeholder={dict.common.comment}
                      className="w-full rounded-full border border-line bg-paper px-3 py-1.5 text-xs outline-none focus:border-primary-400"
                    />
                    <button
                      onClick={() => addComment(post.id, null)}
                      disabled={!(commentDraft[`${post.id}:root`] ?? "").trim()}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white transition disabled:opacity-30"
                      aria-label="send"
                    >
                      <Send size={13} className="rtl:-scale-x-100" />
                    </button>
                  </div>
                )}
              </motion.article>
            );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <aside className="lg:sticky lg:top-24">
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
          <div className="mb-1 flex items-center gap-2">
            <Users size={16} className="text-primary-600" />
            <h3 className="text-sm font-bold text-ink">{dict.community.activeMembersTitle}</h3>
          </div>
          <p className="mb-4 text-xs leading-5 text-ink/65">{dict.community.activeMembersSubtitle}</p>

          <div className="space-y-3.5">
            {creatorMember && (
              <div className="flex items-center gap-3">
                <span className="relative shrink-0">
                  <Avatar accent={creatorMember.avatarAccent} name={creatorMember.name} />
                  <span className="absolute -bottom-0.5 -end-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-success" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{creatorMember.name}</p>
                  <p className="text-[11px] font-medium text-accent-700">{dict.community.creatorBadge}</p>
                </div>
              </div>
            )}

            {activeMembers.length === 0 ? (
              <p className="text-xs text-ink/65">{dict.community.activeMembersEmpty}</p>
            ) : (
              <>
                {activeMembers.slice(0, 8).map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <span className="relative shrink-0">
                      <Avatar accent={member.avatarAccent} name={member.name} small />
                      <span className="absolute -bottom-0.5 -end-0.5 h-2 w-2 rounded-full border-2 border-surface bg-success" />
                    </span>
                    <p className="truncate text-sm text-ink/75">{member.name}</p>
                  </div>
                ))}
                {activeMembers.length > 8 && (
                  <p className="ps-11 text-xs font-medium text-ink/65">
                    {t(dict.community.andMore, { count: activeMembers.length - 8 })}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

function CommentThread({
  comment,
  allComments,
  postId,
  locale,
  dict,
  replyingTo,
  setReplyingTo,
  commentDraft,
  setCommentDraft,
  onReply,
  canReply,
  depth = 0
}: {
  comment: PostComment;
  allComments: PostComment[];
  postId: string;
  locale: Locale;
  dict: Dictionary;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  commentDraft: Record<string, string>;
  setCommentDraft: (fn: (prev: Record<string, string>) => Record<string, string>) => void;
  onReply: (postId: string, parentId: string | null) => void;
  canReply: boolean;
  depth?: number;
}) {
  const author = getUserById(comment.userId);
  const replies = allComments
    .filter((c) => c.parentId === comment.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const draftKey = `${postId}:${comment.id}`;
  const REPLIES_PREVIEW = 3;
  const [showAllReplies, setShowAllReplies] = useState(false);
  const visibleReplies = showAllReplies ? replies : replies.slice(0, REPLIES_PREVIEW);

  return (
    <div className={depth > 0 ? "ms-8" : ""}>
      <div className="flex items-start gap-2.5">
        <Avatar accent={author?.avatarAccent ?? "ink"} name={author?.name ?? ""} small />
        <div className="min-w-0 flex-1">
          <div className="rounded-xl bg-paper px-3 py-2">
            <p className="text-xs font-semibold text-ink">{author?.name}</p>
            <p className="text-xs leading-5 text-ink/70">{comment.content}</p>
          </div>
          {canReply && (
            <button
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className="mt-1 text-[11px] font-medium text-ink/65 hover:text-primary-600"
            >
              {dict.common.reply}
            </button>
          )}
          {replyingTo === comment.id && (
            <div className="mt-1.5 flex items-center gap-2">
              <input
                value={commentDraft[draftKey] ?? ""}
                onChange={(e) => setCommentDraft((prev) => ({ ...prev, [draftKey]: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && onReply(postId, comment.id)}
                placeholder={dict.community.replyPlaceholder}
                className="w-full rounded-full border border-line bg-paper px-3 py-1.5 text-xs outline-none focus:border-primary-400"
              />
              <button
                onClick={() => onReply(postId, comment.id)}
                disabled={!(commentDraft[draftKey] ?? "").trim()}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white transition disabled:opacity-30"
                aria-label="send"
              >
                <Send size={12} className="rtl:-scale-x-100" />
              </button>
            </div>
          )}
        </div>
      </div>
      {replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {visibleReplies.map((r) => (
            <CommentThread
              key={r.id}
              comment={r}
              allComments={allComments}
              postId={postId}
              locale={locale}
              dict={dict}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              commentDraft={commentDraft}
              setCommentDraft={setCommentDraft}
              onReply={onReply}
              canReply={canReply}
              depth={depth + 1}
            />
          ))}
          {!showAllReplies && replies.length > REPLIES_PREVIEW && (
            <button
              onClick={() => setShowAllReplies(true)}
              className="ms-8 text-[11px] font-semibold text-primary-600 hover:underline"
            >
              {t(dict.community.viewReplies, { count: formatNumber(replies.length, locale) })}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Avatar({ accent, name, small }: { accent: AccentKey; name: string; small?: boolean }) {
  const style = getAccent(accent);
  const size = small ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs";
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white ${style.gradient} ${size}`}
    >
      {initials(name)}
    </span>
  );
}
