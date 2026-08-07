"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { CreatorCommunity } from "@/lib/api-types";
import { t } from "@/lib/i18n/t";
import { useAuth } from "@/lib/auth-context";
import DashboardPageHeader from "./DashboardPageHeader";
import RealCommunityFeedView from "./RealCommunityFeedView";
import EmptyState from "./EmptyState";
import PageLoader from "./PageLoader";

// getMyCommunities needs a Bearer token, so unlike the student-facing feed
// page (which resolves the community server-side via the public
// getCommunityDetails endpoint), the creator's own community id has to be
// looked up client-side here before RealCommunityFeedView can render.
export default function CreatorCommunityFeedView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { user, getMyCommunities } = useAuth();
  const [loading, setLoading] = useState(true);
  const [community, setCommunity] = useState<CreatorCommunity | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user || user.role !== "creator") {
        setLoading(false);
        return;
      }
      const list = await getMyCommunities(locale);
      if (!cancelled) {
        setCommunity(list[0] ?? null);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, locale]);

  if (!user || user.role !== "creator") return null;

  if (loading) return <PageLoader />;
  if (!community) return <EmptyState icon={MessageSquare} title={dict.common.empty} />;

  return (
    <div>
      <DashboardPageHeader title={t(dict.creatorDash.communityModTitle, { name: user.name })} />
      <RealCommunityFeedView
        communityId={community.id}
        creatorId={user.id}
        communityType={community.type}
        locale={locale}
        dict={dict}
      />
    </div>
  );
}
