"use client";

import { MessageSquare } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { t } from "@/lib/i18n/t";
import { useAuth } from "@/lib/auth-context";
import { usePlatformStore } from "@/lib/platform-store";
import CommunityFeed from "./CommunityFeed";
import EmptyState from "./EmptyState";
import DashboardPageHeader from "./DashboardPageHeader";

export default function CreatorCommunityView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { user } = useAuth();
  const store = usePlatformStore();
  if (!user || user.role !== "creator") return null;

  const community = store.communities.all.find((c) => c.creatorId === user.id);
  if (!community) return <EmptyState icon={MessageSquare} title={dict.common.empty} />;

  return (
    <div>
      <DashboardPageHeader title={t(dict.creatorDash.communityModTitle, { name: user.name })} />
      <CommunityFeed communityId={community.id} locale={locale} dict={dict} creatorId={user.id} />
    </div>
  );
}
