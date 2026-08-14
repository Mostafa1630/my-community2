"use client";

import Link from "next/link";
import type { FeedComment } from "@/lib/api-types";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { t } from "@/lib/i18n/t";

export default function FeedCommentPreview({
  comments,
  commentsCount,
  detailHref,
  dict,
}: {
  comments: FeedComment[];
  commentsCount: number;
  detailHref: string;
  dict: Dictionary;
}) {
  if (comments.length === 0 && commentsCount <= comments.length) return null;

  const showAllLink = commentsCount > comments.length;

  return (
    <div className="space-y-2">
      {comments.map((c) => (
        <Link
          key={c.id}
          href={`${detailHref}?tab=comments`}
          className="flex items-start gap-2.5 rounded-lg py-0.5 transition hover:bg-paper/60"
        >
          <img
            src={c.user.profileImage || "/images/avatar-placeholder.jpg"}
            alt=""
            className="mt-0.5 h-7 w-7 shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1 text-sm leading-6">
            <span className="font-semibold text-ink">{c.user.name}</span>{" "}
            <span className="text-ink/75">{c.content}</span>
            {c.repliesCount > 0 && (
              <span className="mt-0.5 block text-xs font-medium text-primary-600">
                {t(dict.community.viewReplies, { count: c.repliesCount })}
              </span>
            )}
          </div>
        </Link>
      ))}

      {showAllLink && (
        <Link
          href={`${detailHref}?tab=comments`}
          className="block ps-9 text-xs font-medium text-ink/45 hover:text-primary-700"
        >
          {t(dict.community.viewAllComments, { count: commentsCount })}
        </Link>
      )}
    </div>
  );
}
