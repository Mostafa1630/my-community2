import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Lock, MessageSquare, Star, Unlock, Users2 } from "lucide-react";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { t } from "@/lib/i18n/t";
import { localizedAlternates, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { getCommunityDetails } from "@/lib/api-content";
import { readServerAuthToken } from "@/lib/server-auth";
import { getAccent, initials } from "@/lib/accents";
import RealCommunitySubscribeCard from "@/components/RealCommunitySubscribeCard";
import CommunityReviewForm from "@/components/CommunityReviewForm";
import CommunityReviewsList from "@/components/CommunityReviewsList";
import FavoriteButton from "@/components/FavoriteButton";

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string; id: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const authToken = await await readServerAuthToken();
  const community = await getCommunityDetails(params.id, locale, authToken);
  if (!community) return {};
  const image = community.coverImage || DEFAULT_OG_IMAGE;
  return {
    title: community.name,
    description: community.categoryName,
    alternates: localizedAlternates(locale, `/communities/${community.id}`),
    openGraph: { title: community.name, images: [image] },
    twitter: { title: community.name, images: [image] }
  };
}

export default async function CommunityDetailsPage(props: { params: Promise<{ locale: string; id: string }> }) {
  const params = await props.params;
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  const authToken = await readServerAuthToken();
  const community = await getCommunityDetails(params.id, locale, authToken);
  if (!community) notFound();

  const accent = getAccent(community.accent);
  const isPrivate = community.type === "private";

  return (
    <div>
      <div className={`relative overflow-hidden bg-gradient-to-br ${accent.gradient}`}>
        {community.coverImage && (
          <>
            <img src={community.coverImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25" />
          </>
        )}
        <div className="absolute end-4 top-4 z-10">
          <FavoriteButton
            favoritableType="community"
            favoritableId={community.id}
            locale={locale}
            initialIsFavorite={community.isFavorite}
          />
        </div>
        <div className="container-page relative z-10 flex flex-col items-center gap-5 py-12 text-center text-white sm:py-16">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {community.categoryName && (
              <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold backdrop-blur-sm">
                {community.categoryName}
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold backdrop-blur-sm ${
                isPrivate ? "bg-danger/25 text-white" : "bg-white/15 text-white"
              }`}
            >
              {isPrivate ? <Lock size={11} /> : <Unlock size={11} />}
              {isPrivate ? dict.communities.privateBadge : dict.communities.publicBadge}
            </span>
          </div>

          <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-white/25 bg-white/15 shadow-lg sm:h-24 sm:w-24">
            {community.creator.profileImage ? (
              <img src={community.creator.profileImage} alt={community.name} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-2xl font-bold sm:text-3xl">
                {initials(community.name)}
              </span>
            )}
          </span>

          <div className="max-w-2xl space-y-2">
            <h1 className="text-2xl font-bold leading-snug sm:text-3xl">{community.name}</h1>
            <Link
              href={`/${locale}/creators/${community.creator.id}`}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 py-1 ps-1 pe-3.5 text-sm text-white/90 backdrop-blur-sm transition hover:bg-white/15 hover:text-white"
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-bold text-white ${accent.gradient}`}
              >
                {initials(community.creator.name)}
              </span>
              {community.creator.name}
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/80 sm:text-sm">
            <span className="flex items-center gap-1.5">
              <Users2 size={14} />
              {community.subscriptionsCount} {dict.communities.subscribersLabel}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen size={14} />
              {community.coursesCount} {dict.common.courses}
            </span>
            {community.ratingAvg > 0 && (
              <span className="flex items-center gap-1.5">
                <Star size={14} className="fill-accent-300 text-accent-300" />
                {community.ratingAvg.toFixed(1)}
                {community.reviewsCount > 0 && (
                  <span className="text-white/60">
                    {t(dict.communityDetails.reviewsCount, { count: community.reviewsCount })}
                  </span>
                )}
              </span>
            )}
            {!isPrivate && (
              <Link
                href={`/${locale}/communities/${community.id}/feed`}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-white/90 backdrop-blur-sm transition hover:bg-white/15 hover:text-white"
              >
                <MessageSquare size={14} />
                {dict.communityDetails.goToFeed}
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container-page grid gap-8 py-8 sm:py-10 lg:grid-cols-[minmax(0,1fr),min(100%,22rem)] lg:items-start lg:gap-10">
        <div className="order-2 space-y-8 lg:order-1">
          <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-5 py-5 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-ink">{dict.communityDetails.reviewsTitle}</h2>
                {community.reviewsCount > 0 ? (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-ink/65">
                    <Star size={14} className="fill-accent-400 text-accent-400" />
                    {t(dict.communityDetails.reviewsCount, { count: community.reviewsCount })}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-ink/65">{dict.communityDetails.noReviewsYet}</p>
                )}
              </div>
              {community.reviewsCount > 0 && (
                <div className="flex items-center gap-2 rounded-2xl bg-accent-50 px-4 py-2.5">
                  <span className="font-mono text-2xl font-bold leading-none text-ink">
                    {community.ratingAvg.toFixed(1)}
                  </span>
                  <Star size={18} className="fill-accent-400 text-accent-400" />
                </div>
              )}
            </div>

            <div className="px-5 pb-5 sm:px-6 sm:pb-6">
              {community.reviews.length > 0 && (
                <CommunityReviewsList reviews={community.reviews} locale={locale} dict={dict} embedded />
              )}
              <CommunityReviewForm communityId={community.id} locale={locale} dict={dict} embedded />
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <h2 className="text-lg font-bold text-ink">{dict.communityDetails.coursesInCommunity}</h2>
              {community.courses.length > 0 && (
                <span className="text-xs font-medium text-ink/55">
                  {community.courses.length} {dict.common.courses}
                </span>
              )}
            </div>
            {community.courses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-surface px-5 py-10 text-center text-sm text-ink/65">
                {dict.common.empty}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {community.courses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/${locale}/courses/${course.id}`}
                    className="hover-lift group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card hover:border-primary-200"
                  >
                    <div className="relative h-36 overflow-hidden bg-ink/5">
                      {course.image ? (
                        <img
                          src={course.image}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${accent.gradient}`}>
                          <BookOpen size={28} className="text-white/70" />
                        </div>
                      )}
                      <div className="absolute end-2 top-2">
                        <FavoriteButton favoritableType="course" favoritableId={course.id} locale={locale} />
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5 p-4">
                      <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink transition-colors group-hover:text-primary-700">
                        {course.title}
                      </h3>
                      {course.description && (
                        <p className="line-clamp-2 text-xs leading-5 text-ink/70">{course.description}</p>
                      )}
                      <p className="mt-auto flex items-center gap-1.5 pt-2 text-xs font-medium text-primary-700">
                        <BookOpen size={13} />
                        {t(dict.communityDetails.lessonsCount, { count: course.lessonsCount })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-24">
            <RealCommunitySubscribeCard community={community} locale={locale} dict={dict} />
          </div>
        </div>
      </div>
    </div>
  );
}
