import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Users2 } from "lucide-react";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { t } from "@/lib/i18n/t";
import { localizedAlternates, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { getCreatorDetails } from "@/lib/api-content";
import { getAccent, initials } from "@/lib/accents";
import EmptyState from "@/components/EmptyState";
import Reveal from "@/components/motion/Reveal";

// No generateStaticParams here — creator ids can't be enumerated at build
// time without a live backend to ask (NEXT_PUBLIC_API_BASE_URL is still
// unset), so this route renders on demand per request instead of being
// pre-generated. Once the base_url is live this still works the same way,
// just without a build-time prerender pass.

export async function generateMetadata({
  params
}: {
  params: { locale: string; id: string };
}): Promise<Metadata> {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const creator = await getCreatorDetails(params.id, locale);
  if (!creator) return {};
  const image = creator.coverImage || creator.profileImage || DEFAULT_OG_IMAGE;
  return {
    title: creator.name,
    description: creator.bio,
    alternates: localizedAlternates(locale, `/creators/${creator.id}`),
    openGraph: { title: creator.name, description: creator.bio, images: [image] },
    twitter: { title: creator.name, description: creator.bio, images: [image] }
  };
}

export default async function CreatorProfilePage({ params }: { params: { locale: string; id: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  const creator = await getCreatorDetails(params.id, locale);
  if (!creator) notFound();

  const accent = getAccent(creator.accent);

  return (
    <div>
      <div className={`relative overflow-hidden bg-gradient-to-br ${accent.gradient}`}>
        {creator.coverImage && (
          <>
            <img src={creator.coverImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
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
          <h1 className="text-2xl font-bold">{creator.name}</h1>
          <p className="max-w-xl text-sm leading-6 text-white/80">{creator.bio}</p>
          {creator.community && (
            <Link
              href={`/${locale}/communities/${creator.community.id}`}
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-medium backdrop-blur transition hover:bg-white/20"
            >
              <Users2 size={13} />
              {creator.community.name}
            </Link>
          )}
        </div>
      </div>

      <div className="container-page py-12">
        <h2 className="mb-6 text-xl font-bold text-ink">{t(dict.creator.coursesBy, { name: creator.name })}</h2>
        {creator.courses.length === 0 ? (
          <EmptyState icon={BookOpen} title={dict.common.empty} />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {creator.courses.map((course, i) => (
              <Reveal key={course.id} index={i}>
                <Link
                  href={`/${locale}/courses/${course.id}`}
                  className="hover-lift flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card hover:border-primary-200"
                >
                  <div className="relative h-36 overflow-hidden bg-ink/5">
                    {course.image && (
                      <img src={course.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                    )}
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
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
