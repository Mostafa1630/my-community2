import type { Metadata } from "next";
import { Plus_Jakarta_Sans, IBM_Plex_Sans_Arabic, IBM_Plex_Mono } from "next/font/google";
import { MotionConfig } from "framer-motion";
import "../globals.css";
import { locales, isLocale, dir, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import { AuthProvider } from "@/lib/auth-context";
import { PlatformStoreProvider } from "@/lib/platform-store";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTopButton from "@/components/ScrollToTopButton";

// Plus Jakarta Sans is a warmer, more distinctive geometric sans than Inter — closer to
// the friendly-but-professional feel of Udemy's own type. It doesn't cover Arabic
// glyphs, so the browser automatically falls back to IBM Plex Sans Arabic (next in the
// font stack, see tailwind.config.ts) for Arabic characters — no per-locale
// font-switching logic needed. Plex Sans Arabic was picked over Noto Sans Arabic for
// being noticeably more polished for UI text at small sizes.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

const plexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-arabic",
  display: "swap"
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap"
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  const title = `${dict.meta.siteName} — ${dict.meta.tagline}`;

  return {
    metadataBase: new URL("https://mujtamaaty.example"),
    title: {
      default: title,
      template: `%s · ${dict.meta.siteName}`
    },
    description: dict.meta.defaultDescription,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ar: "/ar",
        en: "/en"
      }
    },
    openGraph: {
      title,
      description: dict.meta.defaultDescription,
      locale: locale === "ar" ? "ar_EG" : "en_US",
      type: "website",
      images: [DEFAULT_OG_IMAGE]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: dict.meta.defaultDescription,
      images: [DEFAULT_OG_IMAGE]
    },
    robots: {
      index: true,
      follow: true
    }
  };
}

export default function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dictionary = getDictionary(locale);

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: dictionary.meta.siteName,
    description: dictionary.meta.defaultDescription,
    url: `https://mujtamaaty.example/${locale}`
  };

  return (
    <html lang={locale} dir={dir(locale)} className={`${jakarta.variable} ${plexSansArabic.variable} ${plexMono.variable}`}>
      <body>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {/* reducedMotion="user" makes every framer-motion animation in the app (Slider,
            Reveal, SpinReveal, HeroImageReveal, Navbar's menus, etc.) automatically
            collapse to instant opacity-only transitions for anyone with the OS-level
            "reduce motion" preference on — the CSS prefers-reduced-motion block in
            globals.css only covers plain CSS transitions/animations, not these. */}
        <MotionConfig reducedMotion="user">
          <PlatformStoreProvider>
            <AuthProvider>
              <div className="flex min-h-screen flex-col">
                <Navbar locale={locale} dict={dictionary} />
                <main className="flex-1">{children}</main>
                <Footer locale={locale} dict={dictionary} />
                <ScrollToTopButton />
              </div>
            </AuthProvider>
          </PlatformStoreProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
