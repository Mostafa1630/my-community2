"use client";

import Link from "next/link";
import { Facebook, Heart, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import Seal from "./Seal";
import { TikTokIcon, WhatsAppIcon } from "./BrandIcons";

const paymentBadges = [
  { name: "Visa", image: "/images/payment-visa.jpg" },
  { name: "Mastercard", image: "/images/payment-mastercard.jpg" }
];

export default function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { settings } = useAuth();
  const year = new Date().getFullYear();

  // Only rendered when the corresponding /settings field is non-null — per
  // the client's explicit instruction, an icon with no real link behind it
  // shouldn't show up at all rather than pointing at "#".
  const socialLinks = [
    settings?.facebookUrl && {
      icon: Facebook,
      label: "Facebook",
      href: settings.facebookUrl,
      className: "bg-[#1877F2] hover:bg-[#1465D8]"
    },
    settings?.tiktokUrl && {
      icon: TikTokIcon,
      label: "TikTok",
      href: settings.tiktokUrl,
      className: "bg-ink hover:bg-ink/85"
    },
    settings?.instagramUrl && {
      icon: Instagram,
      label: "Instagram",
      href: settings.instagramUrl,
      className: "bg-[#E1306C] hover:bg-[#C42A5D]"
    },
    settings?.twitterUrl && {
      icon: Twitter,
      label: "Twitter",
      href: settings.twitterUrl,
      className: "bg-[#1DA1F2] hover:bg-[#0D8DDB]"
    },
    settings?.youtubeUrl && {
      icon: Youtube,
      label: "YouTube",
      href: settings.youtubeUrl,
      className: "bg-[#FF0000] hover:bg-[#D90000]"
    },
    settings?.linkedinUrl && {
      icon: Linkedin,
      label: "LinkedIn",
      href: settings.linkedinUrl,
      className: "bg-[#0A66C2] hover:bg-[#08549C]"
    },
    settings?.whatsappNumber && {
      icon: WhatsAppIcon,
      label: "WhatsApp",
      href: `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`,
      className: "bg-[#25D366] hover:bg-[#1EBE59]"
    }
  ].filter((link): link is { icon: typeof Facebook; label: string; href: string; className: string } => Boolean(link));

  return (
    <footer className="bg-surface">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Seal size={32} />
          </div>
          <p className="max-w-xs text-sm leading-6 text-ink/65">{dict.footer.about}</p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink">{dict.footer.explore}</h3>
          <ul className="space-y-2 text-sm text-ink/65">
            <li><Link href={`/${locale}`} className="link-underline transition-colors hover:text-primary-700">{dict.nav.communities}</Link></li>
            <li><Link href={`/${locale}/creators`} className="link-underline transition-colors hover:text-primary-700">{dict.nav.creators}</Link></li>
            <li><Link href={`/${locale}/register`} className="link-underline transition-colors hover:text-primary-700">{dict.footer.becomeCreator}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink">{dict.footer.company}</h3>
          <ul className="space-y-2 text-sm text-ink/65">
            <li><Link href={`/${locale}/about`} className="link-underline transition-colors hover:text-primary-700">{dict.footer.aboutUs}</Link></li>
            <li><Link href={`/${locale}#contact`} className="link-underline transition-colors hover:text-primary-700">{dict.footer.contact}</Link></li>
            <li><Link href={`/${locale}/terms`} className="link-underline transition-colors hover:text-primary-700">{dict.legal.termsTitle}</Link></li>
            <li><Link href={`/${locale}/privacy`} className="link-underline transition-colors hover:text-primary-700">{dict.legal.privacyTitle}</Link></li>
          </ul>
        </div>
      </div>

      <div className="container-page flex flex-col items-center gap-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-ink/65 sm:text-start">
            {dict.footer.securePayments}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            {paymentBadges.map((brand) => (
              <span
                key={brand.name}
                className="flex h-9 w-14 items-center justify-center overflow-hidden rounded-md border border-line"
              >
                <img src={brand.image} alt={brand.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
              </span>
            ))}
          </div>
        </div>

        {socialLinks.length > 0 && (
          <div>
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-ink/65 sm:text-end">
              {dict.footer.followUs}
            </p>
            <div className="flex items-center justify-center gap-2.5">
              {socialLinks.map(({ icon: Icon, label, href, className }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-white transition ${className}`}
                >
                  <Icon size={19} strokeWidth={2.5} />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-ink py-5">
        <div className="container-page flex flex-col items-center gap-3 text-xs text-white/60 sm:flex-row sm:justify-between">
          <p className="flex items-center gap-1.5 order-1">
            {dict.footer.madeWithPrefix}
            <Heart size={12} className="fill-danger text-danger" />
            {dict.footer.madeWithSuffix}
          </p>
          <div className="order-3 flex items-center gap-2 sm:order-2">
            <Link href={`/${locale}/about`} className="transition-colors hover:text-white">
              {dict.footer.aboutUs}
            </Link>
            <span aria-hidden="true">·</span>
            <Link href={`/${locale}/privacy`} className="transition-colors hover:text-white">
              {dict.legal.privacyTitle}
            </Link>
            <span aria-hidden="true">·</span>
            <Link href={`/${locale}/terms`} className="transition-colors hover:text-white">
              {dict.legal.termsTitle}
            </Link>
          </div>
          <p className="order-2 sm:order-3">
            © {year} {dict.meta.siteName} — {dict.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
