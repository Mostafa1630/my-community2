import Link from "next/link";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import Seal from "./Seal";

const socialLinks = [
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Twitter, label: "X", href: "#" },
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" }
];

const paymentBadges = [
  { name: "Visa", image: "/images/payment-visa.jpg" },
  { name: "Mastercard", image: "/images/payment-mastercard.jpg" },
  { name: "PayPal", image: "/images/payment-paypal.jpg" },
  { name: "Apple Pay", image: "/images/payment-apple-pay.jpg" }
];

export default function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-surface">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Seal size={32} label={dict.meta.siteName[0]} />
            <span className="font-display text-lg font-bold text-ink">{dict.meta.siteName}</span>
          </div>
          <p className="max-w-xs text-sm leading-6 text-ink/60">{dict.footer.about}</p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink">{dict.footer.explore}</h3>
          <ul className="space-y-2 text-sm text-ink/60">
            <li><Link href={`/${locale}/communities`} className="link-underline transition-colors hover:text-primary-700">{dict.nav.communities}</Link></li>
            <li><Link href={`/${locale}/register`} className="link-underline transition-colors hover:text-primary-700">{dict.footer.becomeCreator}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink">{dict.footer.company}</h3>
          <ul className="space-y-2 text-sm text-ink/60">
            <li><span className="cursor-default">{dict.footer.aboutUs}</span></li>
            <li><span className="cursor-default">{dict.footer.contact}</span></li>
          </ul>
        </div>
      </div>

      <div className="container-page flex flex-col items-center gap-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-ink/40 sm:text-start">
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

        <div>
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-ink/40 sm:text-end">
            {dict.footer.followUs}
          </p>
          <div className="flex items-center justify-center gap-2.5">
            {socialLinks.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-white transition hover:bg-primary-600"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="py-5">
        <p className="container-page text-center text-xs text-ink/45">
          © {year} {dict.meta.siteName}. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}
