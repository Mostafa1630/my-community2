"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass } from "lucide-react";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n/config";
import en from "@/lib/i18n/dictionaries/en.json";
import ar from "@/lib/i18n/dictionaries/ar.json";

const dictionaries = { en, ar };

// Next.js doesn't pass route params to not-found boundaries, so the locale
// can't come from a `params` prop here — read it off the actual browser URL
// instead (usePathname works fine in this boundary, it's just params that
// don't), same pattern Navbar already uses for its language switcher. A
// plain client-side dictionary import (not the server-only getDictionary)
// since this file has to stay a Client Component to call usePathname at all.
export default function NotFound() {
  const pathname = usePathname();
  const segment = pathname?.split("/")[1] ?? "";
  const locale: Locale = isLocale(segment) ? segment : defaultLocale;
  const dict = dictionaries[locale];

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600">
        <Compass size={24} />
      </span>
      <h1 className="text-2xl font-bold text-ink">{dict.notFound.title}</h1>
      <p className="mt-2 max-w-sm text-sm text-ink/65">{dict.notFound.description}</p>
      <Link href={`/${locale}`} className="mt-6 rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white">
        {dict.common.backHome}
      </Link>
    </div>
  );
}
