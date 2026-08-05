import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Star, Users2 } from "lucide-react";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { t } from "@/lib/i18n/t";
import { localizedAlternates, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { getCommunityDetails } from "@/lib/api-content";
import { getAccent, initials } from "@/lib/accents";
import RealCommunitySubscribeCard from "@/components/RealCommunitySubscribeCard";
import CommunityReviewForm from "@/components/CommunityReviewForm";
import CommunityReviewsList from "@/components/CommunityReviewsList";
import FavoriteButton from "@/components/FavoriteButton";

// No generateStaticParams — community ids can't be enumerated at build time
// without a live backend, same reasoning as the creators/[id] route.

export async function generateMetadata({
  params
}: {
  params: { locale: string; id: string };
}): Promise<Metadata> {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const community = await getCommunityDetails(params.id, locale);
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

export default async function CommunityDetailsPage({ params }: { params: { locale: string; id: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  const community = await getCommunityDetails(params.id, locale);
  if (!community) notFound();

  const accent = getAccent(community.accent);

  return (
    <div>
      <div className={`relative overflow-hidden bg-gradient-to-br ${accent.gradient}`}>
        {community.coverImage && (
          <>
            <img src={community.coverImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
          </>
        )}
        <div className="absolute end-4 top-4">
          <FavoriteButton favoritableType="community" favoritableId={community.id} locale={locale} />
        </div>
        <div className="container-page relative flex flex-col items-center gap-4 py-14 text-center text-white">
          <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-dashed border-white/50 bg-white/10">
            {community.creator.profileImage ? (
              <img src={community.creator.profileImage} alt={community.name} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-2xl font-bold">
                {initials(community.name)}
              </span>
            )}
          </span>
          <h1 className="text-2xl font-bold">{community.name}</h1>
          <Link
            href={`/${locale}/creators/${community.creator.id}`}
            className="flex items-center gap-1.5 text-sm text-white/85 hover:text-white"
          >
            {community.creator.name}
          </Link>
          <p className="flex items-center gap-1.5 text-xs text-white/70">
            <Users2 size={13} />
            {community.subscriptionsCount} {dict.communities.subscribersLabel}
          </p>
        </div>
      </div>

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[1.6fr,1fr]">
        <div>
          <h2 className="mb-3 text-lg font-bold text-ink">{dict.communityDetails.reviewsTitle}</h2>
          {community.reviewsCount > 0 ? (
            <p className="flex items-center gap-1.5 text-sm text-ink/70">
              <Star size={15} className="fill-accent-400 text-accent-400" />
              {community.ratingAvg.toFixed(1)} {t(dict.communityDetails.reviewsCount, { count: community.reviewsCount })}
            </p>
          ) : (
            <p className="text-sm text-ink/65">{dict.communityDetails.noReviewsYet}</p>
          )}

          {community.reviews.length > 0 && (
            <CommunityReviewsList reviews={community.reviews} locale={locale} dict={dict} />
          )}

          <CommunityReviewForm communityId={community.id} locale={locale} dict={dict} />

          <h2 className="mb-3 mt-10 text-lg font-bold text-ink">{dict.communityDetails.coursesInCommunity}</h2>
          {community.courses.length === 0 ? (
            <p className="text-sm text-ink/65">{dict.common.empty}</p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {community.courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/${locale}/courses/${course.id}`}
                  className="hover-lift flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card hover:border-primary-200"
                >
                  <div className="relative h-36 overflow-hidden bg-ink/5">
                    {course.image && (
                      <img src={course.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                    )}
                    <div className="absolute end-2 top-2">
                      <FavoriteButton favoritableType="course" favoritableId={course.id} locale={locale} />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5 p-4">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink">{course.title}</h3>
                    <p className="line-clamp-2 text-xs leading-5 text-ink/70">{course.description}</p>
                    <p className="mt-auto flex items-center gap-1.5 pt-2 text-sm font-medium text-primary-700">
                      <BookOpen size={13} />
                      {t(dict.communityDetails.lessonsCount, { count: course.lessonsCount })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="sticky top-24">
            <RealCommunitySubscribeCard community={community} locale={locale} dict={dict} />
          </div>
        </div>
      </div>
    </div>
  );
}
