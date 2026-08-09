import Link from "next/link";
import { PlayCircle } from "lucide-react";
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getCategories, getTopCreatorsApi, getCommunities } from "@/lib/api-content";
import CreatorCard from "@/components/CreatorCard";
import SectionHeading from "@/components/SectionHeading";
import Slider from "@/components/motion/Slider";
import CommunitiesExplorer from "@/components/CommunitiesExplorer";
import ContactSection from "@/components/ContactSection";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return {
    title: dict.home.heroTitle,
    description: dict.meta.defaultDescription
  };
}

export default async function HomePage({ params }: { params: { locale: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);

  const topCreators = await getTopCreatorsApi(locale);
  const categories = await getCategories(locale);
  const initialCommunities = await getCommunities(locale);

  return (
    <div>
      {/* Top content creators */}
      <section className="bg-surface py-14 sm:py-16">
        <div className="container-page">
          <SectionHeading as="h1" title={dict.home.topCreatorsTitle} subtitle={dict.home.topCreatorsSubtitle} />
          {/* Repeated 3x so the slider has enough items to actually scroll with — the
              live catalog will outgrow this on its own; remove the repeat once it does. */}
          <Slider
            items={[0, 1, 2].flatMap((rep) =>
              topCreators.map((creator) => (
                <CreatorCard key={`${creator.id}-${rep}`} creator={creator} locale={locale} dict={dict} />
              ))
            )}
            itemClassName="w-[calc((100%_-_1rem)/1.5)] sm:w-[calc((100%_-_2rem)/3)] lg:w-[calc((100%_-_3rem)/4)]"
          />
        </div>
      </section>

      {/* Newest communities — the full browse/search/filter/pagination experience lives
          here now, not on a separate /communities page (there isn't one anymore). */}
      <section className="py-14 sm:py-16">
        <div className="container-page">
          <SectionHeading title={dict.home.latestTitle} subtitle={dict.home.latestSubtitle} />
          <CommunitiesExplorer initialCommunities={initialCommunities} categories={categories} locale={locale} dict={dict} />
        </div>
      </section>

      {/* CTA banner */}
      <section className="container-page pb-14 sm:pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-12 text-center sm:px-16 sm:py-14">
          <div className="pointer-events-none absolute -end-10 -top-10 h-52 w-52 rounded-full border-2 border-dashed border-white/10" />
          <div className="pointer-events-none absolute -start-16 -bottom-16 h-64 w-64 rounded-full border-2 border-dashed border-white/10" />
          <PlayCircle className="mx-auto mb-4 text-accent-400" size={32} />
          <h2 className="mx-auto max-w-lg text-2xl font-bold text-white sm:text-3xl">
            {dict.home.ctaBannerTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/60">{dict.home.ctaBannerSubtitle}</p>
          <Link
            href={`/${locale}/register`}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-accent-500 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-accent-400"
          >
            {dict.home.ctaBannerButton}
          </Link>
        </div>
      </section>

      <ContactSection locale={locale} dict={dict} />
    </div>
  );
}
