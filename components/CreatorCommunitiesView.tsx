"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Pencil, Plus, Tag } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { CreatorCommunity } from "@/lib/api-types";
import { useAuth } from "@/lib/auth-context";
import { formatPrice } from "@/lib/format";
import { initials } from "@/lib/accents";
import Badge from "@/components/Badge";
import DashboardPageHeader from "@/components/DashboardPageHeader";
import PageLoader from "@/components/PageLoader";
import CommunityMembersStrip from "@/components/CommunityMembersStrip";


export default function CreatorCommunitiesView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { user, getMyCommunities, settings } = useAuth();
  const [loading, setLoading] = useState(true);
  const [community, setCommunity] = useState<CreatorCommunity | null>(null);
  const [coverFailed, setCoverFailed] = useState(false);

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

  const base = `/${locale}/creator`;
  const name = community?.name ?? "";
  const description = community?.description ?? "";

  return (
    <div>
      <DashboardPageHeader
        title={dict.creatorDash.myCommunityTitle}
        subtitle={dict.creatorDash.myCommunitySubtitle}

        action={
          community ? (
            <Link
              href={`${base}/community/${community.id}/edit`}
              className="flex items-center gap-1.5 rounded-full bg-accent-500 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-accent-400"
            >
              <Pencil size={16} />
              {dict.creatorDash.communityEditTitle}
            </Link>
          ) : undefined
        }
      />

      {loading ? (
        <PageLoader />
      ) : !community ? (
        <Link
          href={`${base}/community/new`}
          className="flex min-h-[24rem] flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed border-line bg-surface/60 px-6 text-center transition hover:border-primary-300 hover:bg-primary-50/40"
        >
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <Plus size={40} />
          </span>
          <span className="text-lg font-semibold text-ink">{dict.creatorDash.communityAddCta}</span>
        </Link>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
          <div className="relative h-56 sm:h-72">
            {community.coverImage && !coverFailed ? (
              <img
                src={community.coverImage}
                alt=""
                className="h-full w-full object-cover"
                onError={() => setCoverFailed(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15 text-2xl font-bold text-white">
                  {initials(name)}
                </span>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-6 pb-5 pt-16 text-end sm:px-8">
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{name}</h2>
            </div>
            <span className="absolute bottom-3 left-3 z-10 flex items-center justify-center rounded-md bg-ink/60 px-2 py-1 text-center text-[11px] font-medium text-white backdrop-blur">
              1200 × 400
            </span>
          </div>

          <div className="p-6 sm:p-8">
            {description && (
              <p className="mb-8 max-w-2xl text-sm leading-7 text-ink/70">{description}</p>
            )}

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-line bg-paper p-4 sm:p-5">
                <p className="mb-2 text-xs font-medium tracking-wide text-ink/55">{dict.common.category}</p>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                  <Tag size={13} className="shrink-0 text-primary-600" />
                  {community.categoryName}
                </p>
              </div>
              <div className="rounded-xl border border-line bg-paper p-4 sm:p-5">
                <p className="mb-2 text-xs font-medium tracking-wide text-ink/55">{dict.creatorDash.fieldCommunityType}</p>
                <Badge tone={community.type === "public" ? "success" : "pending"}>
                  {community.type === "public"
                    ? dict.creatorDash.communityTypePublic
                    : dict.creatorDash.communityTypePrivate}
                </Badge>
              </div>
              <div className="rounded-xl border border-line bg-paper p-4 sm:p-5">
                <p className="mb-2 text-xs font-medium tracking-wide text-ink/55">{dict.common.price}</p>
                <p className="font-mono text-sm font-semibold text-ink">
                  {community.isFree ? dict.common.free : formatPrice(community.finalPrice, locale, settings?.currency)}
                </p>
              </div>
              <div className="rounded-xl border border-line bg-paper p-4 sm:p-5">
                <p className="mb-2 text-xs font-medium tracking-wide text-ink/55">{dict.creatorDash.fieldCommunityDiscount}</p>
                <p className="text-sm font-semibold text-ink">
                  {community.discountPercentage > 0 ? `${community.discountPercentage}%` : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {community && (
        <div className="mt-6">
          <CommunityMembersStrip
            communityId={community.id}
            locale={locale}
            dict={dict}
            title={dict.creatorDash.subscribersTitle}
          />
        </div>
      )}
    </div>
  );
}
