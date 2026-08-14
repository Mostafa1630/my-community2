"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import HeroCopy from "@/components/HeroCopy";import HeroStats from "@/components/HeroStats";
import ScrollToSectionLink from "@/components/ScrollToSectionLink";
import type { PlatformSettings } from "@/lib/api-types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { getSiteName } from "@/lib/platform-branding";

export default function HomeHero({
  locale,
  dict,
  settings,
  communitiesCount,
  creatorsCount
}: {
  locale: Locale;
  dict: Dictionary;
  settings: PlatformSettings | null;
  communitiesCount: number;
  creatorsCount: number;
}) {
  const siteName = getSiteName(settings, dict);
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;
  const numberLocale = locale === "ar" ? "ar-EG" : "en-US";

  const stats = [    communitiesCount > 0 && {
      value: communitiesCount,
      label: dict.home.statsCommunities
    },
    creatorsCount > 0 && {
      value: creatorsCount,
      label: dict.home.statsCreators
    }
  ].filter((item): item is { value: number; label: string } => Boolean(item));

  return (
    <section className="relative overflow-hidden bg-paper">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary-50/55 from-0% via-primary-50/15 via-45% to-paper to-100%"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(100%,32rem)] bg-[radial-gradient(ellipse_75%_60%_at_50%_-5%,rgba(14,91,82,0.11),transparent_65%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -end-16 top-1/3 h-48 w-48 rounded-full bg-accent-200/20 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -start-20 bottom-1/4 h-40 w-40 rounded-full bg-primary-100/25 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent via-paper/40 to-surface"
        aria-hidden="true"
      />

      <div className="container-page relative z-[1] py-12 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <HeroCopy
            siteName={siteName}
            headline={dict.home.heroHeadline}
            subtitle={dict.home.heroSubtitle}
          />

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">            <ScrollToSectionLink
              href={`/${locale}#communities`}
              sectionId="communities"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-600 sm:w-auto"
            >
              {dict.home.heroBrowseCommunities}
              <Arrow size={16} />
            </ScrollToSectionLink>
            <Link
              href={`/${locale}/register`}
              className="inline-flex w-full items-center justify-center rounded-full border border-line bg-surface px-6 py-3 text-sm font-semibold text-ink/80 transition hover:border-primary-300 hover:text-primary-700 sm:w-auto"
            >
              {dict.home.heroGetStarted}
            </Link>
          </div>

          {stats.length > 0 && <HeroStats stats={stats} locale={numberLocale} />}        </div>
      </div>
    </section>
  );
}
