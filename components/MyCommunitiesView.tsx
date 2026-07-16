"use client";

import Link from "next/link";
import { Users2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { t } from "@/lib/i18n/t";
import { useAuth } from "@/lib/auth-context";
import { usePlatformStore } from "@/lib/platform-store";
import { getCommunityById, getCreatorById } from "@/lib/data";
import { getAccent, initials } from "@/lib/accents";
import { formatDate } from "@/lib/format";
import Badge from "./Badge";
import EmptyState from "./EmptyState";

export default function MyCommunitiesView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { user, role, subscribeToCommunity } = useAuth();
  const store = usePlatformStore();

  const latestByCommmunity =
    role === "student"
      ? Array.from(
          store.communitySubscriptions.all
            .filter((s) => s.studentId === user?.id)
            .reduce((map, s) => {
              const prev = map.get(s.communityId);
              if (!prev || new Date(s.endsAt).getTime() > new Date(prev.endsAt).getTime()) {
                map.set(s.communityId, s);
              }
              return map;
            }, new Map<string, (typeof store.communitySubscriptions.all)[number]>())
            .values()
        )
      : [];

  if (role !== "student" || latestByCommmunity.length === 0) {
    return (
      <EmptyState
        icon={Users2}
        title={dict.student.noCommunities}
        action={
          <Link
            href={`/${locale}/communities`}
            className="rounded-full bg-primary-500 px-4 py-2 text-sm font-medium text-white"
          >
            {dict.student.browseCommunities}
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {latestByCommmunity.map((subscription) => {
        const community =
          store.communities.all.find((c) => c.id === subscription.communityId) ??
          getCommunityById(subscription.communityId);
        if (!community) return null;
        const creator = getCreatorById(community.creatorId);
        const accent = getAccent(creator?.avatarAccent ?? "ink");
        const name = locale === "ar" ? community.nameAr : community.nameEn;
        const expired = subscription.status !== "active" || new Date(subscription.endsAt).getTime() <= Date.now();

        return (
          <div key={community.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5 shadow-card">
            <Link href={`/${locale}/communities/${community.slug}`} className="group flex items-center gap-4">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white ${accent.gradient}`}>
                {initials(name)}
              </span>
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-ink group-hover:text-primary-700">{name}</h3>
                {creator && <p className="mt-0.5 truncate text-xs text-ink/50">{creator.name}</p>}
              </div>
            </Link>

            <div className="flex items-center justify-between">
              <Badge tone={expired ? "danger" : "success"}>
                {expired ? dict.communityDetails.subscriptionExpired : dict.common.active}
              </Badge>
              <span className="text-xs text-ink/45">
                {t(dict.communityDetails.expiresOn, { date: formatDate(subscription.endsAt, locale) })}
              </span>
            </div>

            {expired ? (
              <button
                onClick={() => subscribeToCommunity(community.id)}
                className="flex w-full items-center justify-center rounded-full bg-primary-500 py-2 text-sm font-semibold text-white hover:bg-primary-600"
              >
                {dict.communityDetails.renewSubscription}
              </button>
            ) : (
              <Link
                href={`/${locale}/communities/${community.slug}/feed`}
                className="flex w-full items-center justify-center rounded-full border border-line py-2 text-sm font-medium text-ink/70 hover:border-primary-300 hover:text-primary-700"
              >
                {dict.communityDetails.enterCommunity}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
