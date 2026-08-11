"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { CommunitySummary } from "@/lib/api-types";
import { useAuth } from "@/lib/auth-context";
import RealCommunityCard from "./RealCommunityCard";
import Pagination from "./Pagination";
import EmptyState from "./EmptyState";
import PageLoader from "./PageLoader";

// GET /communities/my-subscriptions — same item shape as the public
// GET /communities list, just scoped to the signed-in student's own real
// subscriptions and requiring auth, so this goes through auth-context
// rather than the public api-content fetchers.
export default function MyCommunitiesView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { hydrated, role, getMySubscriptions } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CommunitySummary[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    if (!hydrated || role !== "student") {
      if (hydrated) setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getMySubscriptions(locale, page)
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setLastPage(res.lastPage);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, role, locale, page]);

  if (!hydrated || loading) return <PageLoader />;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Users2}
        title={dict.student.noCommunities}
        action={
          <Link
            href={`/${locale}`}
            className="rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
          >
            {dict.student.browseCommunities}
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((community, i) => (
          <RealCommunityCard
            key={community.id}
            community={community}
            locale={locale}
            dict={dict}
            priority={i < 4}
            subscribed
          />
        ))}
      </div>
      <Pagination page={page} totalPages={lastPage} onChange={setPage} dict={dict} />
    </div>
  );
}
