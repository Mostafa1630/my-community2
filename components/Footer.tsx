import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import Seal from "./Seal";

export default function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
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

        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink">{dict.footer.legal}</h3>
          <ul className="space-y-2 text-sm text-ink/60">
            <li><span className="cursor-default">{dict.footer.terms}</span></li>
            <li><span className="cursor-default">{dict.footer.privacy}</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-5">
        <p className="container-page text-center text-xs text-ink/45">
          © {year} {dict.meta.siteName}. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}
