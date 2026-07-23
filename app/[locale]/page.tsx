import Link from "next/link";
import { GraduationCap, PlayCircle, ShieldCheck, ScrollText } from "lucide-react";
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { categories, getLatestCommunities, getTopCreators } from "@/lib/data";
import CommunityCard from "@/components/CommunityCard";
import CreatorCard from "@/components/CreatorCard";
import CategoryPill from "@/components/CategoryPill";
import SectionHeading from "@/components/SectionHeading";
import Slider from "@/components/motion/Slider";
import SpinReveal from "@/components/motion/SpinReveal";
import HeroImageReveal from "@/components/motion/HeroImageReveal";
import HeroButtons from "@/components/motion/HeroButtons";
import CountUp from "@/components/motion/CountUp";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return {
    title: dict.home.heroTitle,
    description: dict.meta.defaultDescription
  };
}

export default function HomePage({ params }: { params: { locale: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);

  const latest = getLatestCommunities(8);
  const topCreators = getTopCreators(4);

  const heroText = (
    <div className="flex flex-col items-center text-center lg:items-start lg:text-start">
      <h1 className="max-w-xl text-2xl font-bold leading-[1.6] text-ink sm:text-3xl lg:text-4xl">
        {dict.home.heroTitle}
      </h1>
      <p className="mt-5 max-w-lg text-sm leading-7 text-ink/60">{dict.home.heroSubtitle}</p>
      <HeroButtons
        primary={
          <Link
            href={`/${locale}/communities`}
            className="flex items-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-raised transition hover:bg-primary-600"
          >
            {dict.home.heroCtaPrimary}
          </Link>
        }
        secondary={
          <Link
            href={`/${locale}/register`}
            className="rounded-full border border-line bg-surface px-6 py-3 text-sm font-semibold text-ink transition hover:border-primary-300"
          >
            {dict.home.heroCtaSecondary}
          </Link>
        }
      />
    </div>
  );

  const heroImage = (
    <HeroImageReveal>
      <div className="relative mx-auto w-full max-w-md lg:max-w-none">
        {/* Drop the photo at public/images/hero-creator.jpg — this <img> already points at it. */}
        <img
          src="/images/hero-creator.jpg"
          alt={dict.home.heroImageAlt}
          loading="eager"
          fetchPriority="high"
          className="aspect-[4/3] w-full rounded-3xl border border-line object-cover shadow-raised"
        />
        <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-raised sm:left-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white">
            <GraduationCap size={18} />
          </span>
          <div className="whitespace-nowrap">
            <p className="font-mono text-base font-bold text-ink">
              <CountUp from={100} to={10000} suffix="+" />
            </p>
            <p className="text-xs text-ink/55">{dict.home.heroStat}</p>
          </div>
        </div>
      </div>
    </HeroImageReveal>
  );

  return (
    <div>
      {/* Hero */}
      <section className="bg-surface">
        <div className="container-page grid gap-12 py-14 sm:py-16 lg:grid-cols-2 lg:items-center lg:gap-10 lg:py-24">
          {locale === "ar" ? (
            <>
              {heroImage}
              {heroText}
            </>
          ) : (
            <>
              {heroText}
              {heroImage}
            </>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="container-page py-14 sm:py-16">
        <SectionHeading title={dict.home.categoriesTitle} />
        {/* Repeated 3x so the slider has enough items to actually scroll with — the
            live catalog will outgrow this on its own; remove the repeat once it does. */}
        <Slider
          items={[0, 1, 2].flatMap((rep) =>
            categories.map((category) => (
              <CategoryPill key={`${category.id}-${rep}`} category={category} locale={locale} />
            ))
          )}
          itemClassName="w-[46%] sm:w-[31%] lg:w-[15.5%]"
        />
      </section>

      {/* Top content creators */}
      <section className="bg-surface py-14 sm:py-16">
        <div className="container-page">
          <SectionHeading title={dict.home.topCreatorsTitle} subtitle={dict.home.topCreatorsSubtitle} />
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

      {/* Latest communities */}
      <section className="py-14 sm:py-16">
        <div className="container-page">
          <SectionHeading
            title={dict.home.latestTitle}
            subtitle={dict.home.latestSubtitle}
            action={
              <Link
                href={`/${locale}/communities`}
                className="link-underline text-sm font-semibold text-primary-700"
              >
                {dict.common.seeAll}
              </Link>
            }
          />
          {/* Repeated 3x so the slider has enough items to actually scroll with — the
              live catalog will outgrow this on its own; remove the repeat once it does. */}
          <Slider
            items={[0, 1, 2].flatMap((rep) =>
              latest.map((community) => (
                <CommunityCard key={`${community.id}-${rep}`} community={community} locale={locale} dict={dict} />
              ))
            )}
            itemClassName="w-[calc((100%_-_1rem)/1.5)] sm:w-[calc((100%_-_2rem)/3)] lg:w-[calc((100%_-_3rem)/4)]"
          />
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

      {/* Privacy policy */}
      <section className="bg-surface py-14 sm:py-16">
        {/* Drop the photo at public/images/privacy-security.jpg — this <img> already points at it. */}
        <SpinReveal
          image="/images/privacy-security.jpg"
          alt={dict.home.privacyImageAlt}
          icon={<ShieldCheck size={20} />}
          title={dict.home.privacyTitle}
          body={dict.home.privacyBody}
        />
      </section>

      {/* Terms of use */}
      <section className="py-14 sm:py-16">
        {/* Drop the photo at public/images/terms-agreement.jpg — this <img> already points at it. */}
        <SpinReveal
          image="/images/terms-agreement.jpg"
          alt={dict.home.termsImageAlt}
          icon={<ScrollText size={20} />}
          title={dict.home.termsTitle}
          body={dict.home.termsBody}
        />
      </section>
    </div>
  );
}
