import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Users2 } from "lucide-react";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { localizedAlternates, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { communities, getCommunityBySlug, getCreatorById, getCoursesByCommunity, communitySubscriptions } from "@/lib/data";
import { getAccent, initials } from "@/lib/accents";
import CommunitySubscribeCard from "@/components/CommunitySubscribeCard";
import CommunityReviews from "@/components/CommunityReviews";
import CommunityCoursesGrid from "@/components/CommunityCoursesGrid";

export function generateStaticParams() {
  return locales.flatMap((locale) => communities.map((c) => ({ locale, slug: c.slug })));
}

export async function generateMetadata({
  params
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const community = getCommunityBySlug(params.slug);
  if (!community) return {};
  const name = locale === "ar" ? community.nameAr : community.nameEn;
  const description = locale === "ar" ? community.descriptionAr : community.descriptionEn;
  const image = community.coverImage || DEFAULT_OG_IMAGE;
  return {
    title: name,
    description,
    alternates: localizedAlternates(locale, `/communities/${community.slug}`),
    openGraph: { title: name, description, images: [image] },
    twitter: { title: name, description, images: [image] }
  };
}

export default function CommunityDetailsPage({ params }: { params: { locale: string; slug: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  const community = getCommunityBySlug(params.slug);
  if (!community) notFound();

  const creator = getCreatorById(community.creatorId);
  const courses = getCoursesByCommunity(community.id).filter((c) => c.status === "published");
  const subscribersCount = communitySubscriptions.filter(
    (s) => s.communityId === community.id && s.status === "active" && new Date(s.endsAt).getTime() > Date.now()
  ).length;
  const accent = getAccent(creator?.avatarAccent ?? "ink");
  const name = locale === "ar" ? community.nameAr : community.nameEn;
  const description = locale === "ar" ? community.descriptionAr : community.descriptionEn;

  return (
    <div>
      <div className={`bg-gradient-to-br ${accent.gradient}`}>
        <div className="container-page flex flex-col items-center gap-4 py-14 text-center text-white">
          <span className="seal-ring h-20 w-20 border-white/50 bg-white/10 text-2xl font-bold">
            {initials(name)}
          </span>
          <h1 className="text-2xl font-bold">{name}</h1>
          {creator && (
            <Link href={`/${locale}/creators/${creator.slug}`} className="flex items-center gap-1.5 text-sm text-white/85 hover:text-white">
              {creator.name}
              {creator.verified && <BadgeCheck size={15} />}
            </Link>
          )}
          {description && <p className="max-w-xl text-sm leading-6 text-white/80">{description}</p>}
          <p className="flex items-center gap-1.5 text-xs text-white/70">
            <Users2 size={13} />
            {subscribersCount} {dict.communities.subscribersLabel}
          </p>
        </div>
      </div>

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[1.6fr,1fr]">
        <div>
          <h2 className="mb-3 text-lg font-bold text-ink">{dict.communityDetails.aboutCommunity}</h2>
          <p className="max-w-2xl text-sm leading-7 text-ink/70">{description}</p>

          <h2 className="mb-3 mt-10 text-lg font-bold text-ink">{dict.communityDetails.reviewsTitle}</h2>
          <CommunityReviews communityId={community.id} locale={locale} dict={dict} />

          <h2 className="mb-3 mt-10 text-lg font-bold text-ink">{dict.communityDetails.coursesInCommunity}</h2>
          <CommunityCoursesGrid courses={courses} community={community} locale={locale} dict={dict} />
        </div>

        <div>
          <div className="sticky top-24">
            <CommunitySubscribeCard community={community} locale={locale} dict={dict} />
          </div>
        </div>
      </div>
    </div>
  );
}
