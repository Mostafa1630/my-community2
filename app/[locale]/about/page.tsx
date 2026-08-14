import type { Metadata } from "next";
import { Calendar, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter, Youtube } from "lucide-react";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { t } from "@/lib/i18n/t";
import { localizedAlternates } from "@/lib/seo";
import { getSettings } from "@/lib/api-content";
import { getSiteDescription, getSiteName } from "@/lib/platform-branding";
import { formatDate } from "@/lib/format";
import { TikTokIcon, WhatsAppIcon } from "@/components/BrandIcons";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  const settings = await getSettings(locale);
  const description = getSiteDescription(settings, locale, dict, "about");
  return {
    title: dict.about.eyebrow,
    description,
    alternates: localizedAlternates(locale, "/about")
  };
}

export default async function AboutPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  const settings = await getSettings(locale);

  const siteName = getSiteName(settings, dict);
  const description = getSiteDescription(settings, locale, dict, "about");

  const contactRows = [
    settings?.contactEmail && { icon: Mail, label: dict.about.email, value: settings.contactEmail, href: `mailto:${settings.contactEmail}` },
    settings?.contactPhone && { icon: Phone, label: dict.about.phone, value: settings.contactPhone, href: `tel:${settings.contactPhone}` },
    settings?.contactAddress && { icon: MapPin, label: dict.about.address, value: settings.contactAddress, href: undefined }
  ].filter((row): row is { icon: typeof Mail; label: string; value: string; href?: string } => Boolean(row));

  const socialLinks = [
    settings?.facebookUrl && { icon: Facebook, label: "Facebook", href: settings.facebookUrl, className: "bg-[#1877F2] hover:bg-[#1465D8]" },
    settings?.tiktokUrl && { icon: TikTokIcon, label: "TikTok", href: settings.tiktokUrl, className: "bg-ink hover:bg-ink/85" },
    settings?.instagramUrl && {
      icon: Instagram,
      label: "Instagram",
      href: settings.instagramUrl,
      className: "bg-[#E1306C] hover:bg-[#C42A5D]"
    },
    settings?.twitterUrl && { icon: Twitter, label: "Twitter", href: settings.twitterUrl, className: "bg-[#1DA1F2] hover:bg-[#0D8DDB]" },
    settings?.youtubeUrl && { icon: Youtube, label: "YouTube", href: settings.youtubeUrl, className: "bg-[#FF0000] hover:bg-[#D90000]" },
    settings?.linkedinUrl && { icon: Linkedin, label: "LinkedIn", href: settings.linkedinUrl, className: "bg-[#0A66C2] hover:bg-[#08549C]" },
    settings?.whatsappNumber && {
      icon: WhatsAppIcon,
      label: "WhatsApp",
      href: `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`,
      className: "bg-[#25D366] hover:bg-[#1EBE59]"
    }
  ].filter((link): link is { icon: typeof Facebook; label: string; href: string; className: string } => Boolean(link));

  return (
    <div>
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 pb-16 pt-12 sm:pb-24 sm:pt-20">
        <div className="container-page relative z-10 flex flex-col items-center px-1 text-center sm:px-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur">
            {dict.about.eyebrow}
          </span>
          <h1 className="mt-5 max-w-3xl text-2xl font-extrabold leading-snug text-white sm:text-4xl">
            {t(dict.about.title, { name: siteName })}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl px-2 text-sm leading-7 text-white/85 sm:px-0 sm:text-base">{description}</p>
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

      <div className="container-page overflow-x-hidden py-10 sm:py-16">
        {settings?.lastUpdated && (
          <div className="mb-8 flex justify-center px-1">
            <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-center text-xs font-semibold text-ink/70 shadow-raised">
              <Calendar size={14} className="shrink-0 text-primary-600" />
              <span className="break-words">{dict.about.lastUpdatedLabel}: {formatDate(settings.lastUpdated, locale)}</span>
            </span>
          </div>
        )}

        {contactRows.length > 0 && (
          <div className="mx-auto max-w-4xl px-1">
            <h2 className="mb-5 text-center text-xl font-bold text-ink">{dict.about.contactTitle}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {contactRows.map((row) => {
                const Icon = row.icon;
                const content = (
                  <>
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-500/10 text-primary-600 sm:h-16 sm:w-16">
                      <Icon size={24} className="sm:hidden" />
                      <Icon size={28} className="hidden sm:block" />
                    </span>
                    <div className="min-w-0 flex-1 text-center sm:text-start">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">{row.label}</p>
                      <p className="mt-1 break-all text-sm font-semibold text-ink sm:text-base" dir="ltr">
                        {row.value}
                      </p>
                    </div>
                  </>
                );
                return row.href ? (
                  <a
                    key={row.label}
                    href={row.href}
                    className="hover-lift flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface p-5 shadow-card hover:border-primary-200 sm:flex-row sm:items-center sm:gap-4 sm:p-6"
                  >
                    {content}
                  </a>
                ) : (
                  <div
                    key={row.label}
                    className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface p-5 shadow-card sm:flex-row sm:items-center sm:gap-4 sm:p-6"
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {socialLinks.length > 0 && (
          <div className="mx-auto mt-10 max-w-3xl px-1 text-center sm:mt-12">
            <h2 className="mb-5 text-xl font-bold text-ink">{dict.about.followTitle}</h2>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {socialLinks.map(({ icon: Icon, label, href, className }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-white transition ${className}`}
                >
                  <Icon size={20} strokeWidth={2.5} />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
