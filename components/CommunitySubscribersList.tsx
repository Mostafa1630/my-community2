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
      .catch(() => {
        if (!cancelled) {
          setSubscribers([]);
          setLastPage(1);
          setTotal(0);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId, locale, page]);

  if (compact) {
    return (
      <section className="rounded-2xl border border-line bg-surface shadow-card">
        <div className="border-b border-line px-5 py-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink">
              {title ?? dict.creatorDash.subscribersTitle}
            </h2>

            {!loading && total > 0 && (
              <span className="font-mono text-xs tabular-nums text-ink/45">
                {total}
              </span>
            )}
          </div>

          <p className="mt-1 text-xs leading-5 text-ink/55">
            {dict.community.activeMembersSubtitle}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <PageLoader />
          </div>
        ) : subscribers.length === 0 ? (
          <div className="px-5 py-8">
            <EmptyState
              icon={Users2}
              title={dict.creatorDash.subscribersEmpty}
            />
          </div>
        ) : (
          <>
            <ul className="divide-y divide-line">
              {subscribers.map((s, index) => (
                <li
                  key={`${s.id}-${index}`}
                  className="flex items-center gap-3 px-5 py-3.5"
                >
                  <img
                    src={
                      s.profileImage ||
                      "/images/avatar-placeholder.jpg"
                    }
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-full object-cover"
                  />

                  <span className="min-w-0 truncate text-sm font-medium text-ink">
                    {s.name}
                  </span>
                </li>
              ))}
            </ul>

            {lastPage > 1 && (
              <div className="border-t border-line px-5 py-4">
                <Pagination
                  page={page}
                  totalPages={lastPage}
                  onChange={setPage}
                  dict={dict}
                />
              </div>
            )}
          </>
        )}
      </section>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
      <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-ink">
        <Users2 size={18} className="text-primary-600" />

        {title ?? dict.creatorDash.subscribersTitle}

        {total > 0 && (
          <span className="font-mono text-sm font-normal text-ink/55">
            ({total})
          </span>
        )}
      </h2>

      {loading ? (
        <PageLoader />
      ) : subscribers.length === 0 ? (
        <EmptyState
          icon={Users2}
          title={dict.creatorDash.subscribersEmpty}
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {subscribers.map((s, index) => (
              <div
                key={`${s.id}-${index}`}
                className="flex items-center gap-3 rounded-xl border border-line bg-paper px-3.5 py-2.5"
              >
                <img
                  src={
                    s.profileImage ||
                    "/images/avatar-placeholder.jpg"
                  }
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-full object-cover"
                />

                <p className="truncate text-sm font-medium text-ink">
                  {s.name}
                </p>
              </div>
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={lastPage}
            onChange={setPage}
            dict={dict}
          />
        </>
      )}
    </div>
  );
}