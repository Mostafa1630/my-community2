import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, BookOpen, Users2 } from "lucide-react";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { t } from "@/lib/i18n/t";
import { localizedAlternates, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { creators, getCreatorBySlug, getCommunityByCreatorId, getCoursesByCommunity } from "@/lib/data";
import { getAccent, initials } from "@/lib/accents";
import CourseInCommunityCard from "@/components/CourseInCommunityCard";
import CreatorCommunityGate from "@/components/CreatorCommunityGate";
import EmptyState from "@/components/EmptyState";
import Reveal from "@/components/motion/Reveal";

export function generateStaticParams() {
  return locales.flatMap((locale) => creators.map((c) => ({ locale, slug: c.slug })));
}

export async function generateMetadata({
  params
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const creator = getCreatorBySlug(params.slug);
  if (!creator) return {};
  const description = locale === "ar" ? creator.bioAr : creator.bioEn;
  const image = creator.coverImage || creator.profileImage || DEFAULT_OG_IMAGE;
  return {
    title: creator.name,
    description,
    alternates: localizedAlternates(locale, `/creators/${creator.slug}`),
    openGraph: { title: creator.name, description, images: [image] },
    twitter: { title: creator.name, description, images: [image] }
  };
}

export default function CreatorProfilePage({ params }: { params: { locale: string; slug: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  const creator = getCreatorBySlug(params.slug);
  if (!creator) notFound();

  const accent = getAccent(creator.coverAccent);
  const community = getCommunityByCreatorId(creator.id);
  const communityCourses = community ? getCoursesByCommunity(community.id).filter((c) => c.status === "published") : [];
  const bio = locale === "ar" ? creator.bioAr : creator.bioEn;

  return (
    <div>
      <div className={`relative overflow-hidden bg-gradient-to-br ${accent.gradient}`}>
        {creator.coverImage && (
          <>
            <img
              src={creator.coverImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
          </>
        )}
        <div className="container-page relative flex flex-col items-center gap-4 py-14 text-center text-white">
          <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-dashed border-white/50 bg-white/10">
            {creator.profileImage ? (
              <img src={creator.profileImage} alt={creator.name} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-2xl font-bold">
                {initials(creator.name)}
              </span>
            )}
          </span>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{creator.name}</h1>
            {creator.verified && <BadgeCheck size={20} className="text-white" />}
          </div>
          <p className="max-w-xl text-sm leading-6 text-white/80">{bio}</p>
          {community && (
            <Link
              href={`/${locale}/communities/${community.slug}`}
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-medium backdrop-blur hover:bg-white/15"
            >
              <Users2 size={13} />
              {dict.creator.visitCommunity}
            </Link>
          )}
        </div>
      </div>

      <div className="container-page py-12">
        <h2 className="mb-6 text-xl font-bold text-ink">
          {t(dict.creator.coursesBy, { name: creator.name })}
        </h2>
        {communityCourses.length === 0 || !community ? (
          <EmptyState icon={BookOpen} title={dict.common.empty} />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {communityCourses.map((course, i) => (
              <Reveal key={course.id} index={i}>
                <CourseInCommunityCard course={course} community={community} locale={locale} dict={dict} />
              </Reveal>
            ))}
          </div>
        )}

        <div className="mt-14">
          <h2 className="mb-6 text-xl font-bold text-ink">{dict.creator.communityTitle}</h2>
          {community ? (
            <CreatorCommunityGate creatorId={creator.id} communityId={community.id} locale={locale} dict={dict} />
          ) : (
            <EmptyState icon={BookOpen} title={dict.common.empty} />
          )}
        </div>
      </div>
    </div>
  );
}
