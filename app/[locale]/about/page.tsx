import type { Metadata } from "next";
import { Calendar, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter, Youtube } from "lucide-react";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { t } from "@/lib/i18n/t";
import { localizedAlternates } from "@/lib/seo";
import { getSettings } from "@/lib/api-content";
import { formatDate } from "@/lib/format";
import { TikTokIcon, WhatsAppIcon } from "@/components/BrandIcons";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return {
    title: dict.about.eyebrow,
    description: dict.about.fallbackDescription,
    alternates: localizedAlternates(locale, "/about")
  };
}

export default async function AboutPage({ params }: { params: { locale: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  const settings = await getSettings(locale);

  const siteName = settings?.siteName || dict.meta.siteName;
  const description =
    (locale === "ar" ? settings?.descriptionAr : settings?.descriptionEn) || dict.about.fallbackDescription;

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
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 pb-20 pt-16 sm:pb-24 sm:pt-20">
        <div className="container-page relative z-10 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur">
            {dict.about.eyebrow}
          </span>
          <h1 className="mt-5 text-3xl font-extrabold text-white sm:text-4xl">{t(dict.about.title, { name: siteName })}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">{description}</p>
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

      <div className="container-page py-12 sm:py-16">
        {settings?.lastUpdated && (
          <div className="mb-8 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold text-ink/70 shadow-raised">
              <Calendar size={14} className="text-primary-600" />
              {dict.about.lastUpdatedLabel}: {formatDate(settings.lastUpdated, locale)}
            </span>
          </div>
        )}

        {contactRows.length > 0 && (
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-5 text-center text-xl font-bold text-ink">{dict.about.contactTitle}</h2>
            <div className="grid gap-5 sm:grid-cols-3">
              {contactRows.map((row) => {
                const Icon = row.icon;
                const content = (
                  <>
                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-500/10 text-primary-600">
                      <Icon size={28} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">{row.label}</p>
                      <p className="mt-1 truncate text-base font-semibold text-ink" dir="ltr">
                        {row.value}
                      </p>
                    </div>
                  </>
                );
                return row.href ? (
                  <a
                    key={row.label}
                    href={row.href}
                    className="hover-lift flex items-center gap-4 rounded-2xl border border-line bg-surface p-6 shadow-card hover:border-primary-200"
                  >
                    {content}
                  </a>
                ) : (
                  <div key={row.label} className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-6 shadow-card">
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {socialLinks.length > 0 && (
          <div className="mx-auto mt-12 max-w-3xl text-center">
            <h2 className="mb-5 text-xl font-bold text-ink">{dict.about.followTitle}</h2>
            <div className="flex items-center justify-center gap-2.5">
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
