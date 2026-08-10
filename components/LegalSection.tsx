import { Calendar, type LucideIcon } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";

export type LegalItem = {
  icon: LucideIcon;
  question: string;
  answer: string;
};

// Shared visual system for the Terms & Privacy home-page sections: a gradient
// hero with a wave edge and a floating "last updated" badge, then a two-column
// body — content cards on one side, a sticky table-of-contents on the other.
// The TOC sits first in source order (same convention as DashboardSidebar),
// so it lands on the reading-start side in both directions rather than
// needing a manual rtl: override.
export default function LegalSection({
  id,
  locale,
  badgeIcon: BadgeIcon,
  badgeLabel,
  title,
  subtitle,
  lastUpdatedLabel,
  sectionsLabel,
  items,
  className = ""
}: {
  id: string;
  locale: Locale;
  badgeIcon: LucideIcon;
  badgeLabel: string;
  title: string;
  subtitle: string;
  lastUpdatedLabel: string;
  sectionsLabel: string;
  items: LegalItem[];
  className?: string;
}) {
  const lastUpdated = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    month: "long",
    year: "numeric"
  }).format(new Date());

  return (
    <section id={id} className={className}>
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 pb-16 pt-14 sm:pt-16">
        <div className="container-page relative z-10">
          <div className="flex justify-end">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur">
              <BadgeIcon size={14} />
              {badgeLabel}
            </span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white sm:text-4xl">{title}</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-6 text-white/80 sm:text-base">{subtitle}</p>
        </div>
        <svg
          className="absolute inset-x-0 bottom-0 h-14 w-full text-paper sm:h-20"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path fill="currentColor" d="M0,64 C320,120 720,0 1440,72 L1440,120 L0,120 Z" />
        </svg>
      </div>

      <div className="container-page relative -mt-7 flex justify-center sm:justify-start">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold text-ink/70">
          <Calendar size={14} className="text-primary-600" />
          {lastUpdatedLabel}: {lastUpdated}
        </span>
      </div>

      <div className="container-page flex flex-col gap-6 py-10 sm:py-12 lg:flex-row lg:items-start">
        <aside className="lg:w-64 lg:shrink-0">
          <div className="rounded-2xl border border-line bg-surface p-5 lg:sticky lg:top-24">
            <h3 className="mb-3 text-sm font-bold text-ink">{sectionsLabel}</h3>
            <ul className="space-y-1">
              {items.map((item, i) => (
                <li key={i}>
                  <a
                    href={`#${id}-${i}`}
                    className="block rounded-lg px-2 py-1.5 text-xs font-medium text-ink/65 transition hover:bg-primary-50 hover:text-primary-700"
                  >
                    {item.question}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                id={`${id}-${i}`}
                className="scroll-mt-24 rounded-2xl border border-line bg-surface p-5 sm:p-6"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500/10 text-primary-600">
                    <Icon size={18} />
                  </span>
                  <h4 className="text-sm font-bold text-ink sm:text-base">{item.question}</h4>
                </div>
                <p className="text-sm leading-7 text-ink/65">{item.answer}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
