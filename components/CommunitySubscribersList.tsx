"use client";

import { useEffect, useState } from "react";
import { Users2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { CommunitySubscriber } from "@/lib/api-types";
import { useAuth } from "@/lib/auth-context";
import EmptyState from "./EmptyState";
import PageLoader from "./PageLoader";
import Pagination from "./Pagination";

// GET /creators/communities/{id}/subscriptions — paginated list of a
// creator's own community subscribers (avatar + name only, per the spec).
// `compact` renders a narrower single-column sidebar widget (used next to
// the community feed's posts, labeled "active members" there) instead of
// the wider multi-column card (used standalone on the "My Community" page).
export default function CommunitySubscribersList({
  communityId,
  locale,
  dict,
  title,
  compact = false
}: {
  communityId: string;
  locale: Locale;
  dict: Dictionary;
  title?: string;
  compact?: boolean;
}) {
  const { getCommunitySubscribers } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState<CommunitySubscriber[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCommunitySubscribers(communityId, locale, page)
      .then((res) => {
        if (cancelled) return;
        setSubscribers(res.items);
        setLastPage(res.lastPage);
        setTotal(res.total);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId, locale, page]);

  return (
    <div className={compact ? "rounded-2xl border border-line bg-surface p-5" : "mt-6 rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8"}>
      <h2 className={`mb-5 flex items-center gap-2 font-bold text-ink ${compact ? "text-base" : "text-lg"}`}>
        <Users2 size={compact ? 16 : 18} className="text-primary-600" />
        {title ?? dict.creatorDash.subscribersTitle}
        {total > 0 && <span className="font-mono text-sm font-normal text-ink/55">({total})</span>}
      </h2>

      {loading ? (
        <PageLoader />
      ) : subscribers.length === 0 ? (
        <EmptyState icon={Users2} title={dict.creatorDash.subscribersEmpty} />
      ) : (
        <>
          <div className={compact ? "space-y-2" : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"}>
            {subscribers.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl border border-line bg-paper px-3.5 py-2.5">
                <img
                  src={s.profileImage || "/images/avatar-placeholder.jpg"}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-full object-cover"
                />
                <p className="truncate text-sm font-medium text-ink">{s.name}</p>
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={lastPage} onChange={setPage} dict={dict} />
        </>
      )}
    </div>
  );
}
