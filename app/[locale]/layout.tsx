import type { Metadata } from "next";
import { cookies } from "next/headers";
import {
  Plus_Jakarta_Sans,
  IBM_Plex_Sans_Arabic,
  IBM_Plex_Mono
} from "next/font/google";
import { MotionConfig } from "framer-motion";
import "../globals.css";
import { locales, isLocale, dir, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import { getSettings } from "@/lib/api-content";
import { getSiteDescription, getSiteName } from "@/lib/platform-branding";
import { AuthProvider } from "@/lib/auth-context";
import {
  USER_CACHE_COOKIE,
  parseCachedUserCookie,
  MY_ACCESS_CACHE_COOKIE,
  parseCachedMyAccessCookie
} from "@/lib/api-client";
import type { ApiUser } from "@/lib/api-types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { ToastProvider } from "@/components/ToastProvider";

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
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;

  const locale: Locale = isLocale(localeParam) ? localeParam : "ar";
  const dict = getDictionary(locale);
  const settings = await getSettings(locale);
  const siteName = getSiteName(settings, dict);
  const description = getSiteDescription(settings, locale, dict);
  const title = `${siteName} — ${dict.meta.tagline}`;

  return {
    metadataBase: new URL("https://nadi-community.com"),
    title: {
      default: title,
      template: `%s · ${siteName}`
    },
    description,
    ...(settings?.siteFavicon
      ? { icons: { icon: settings.siteFavicon } }
      : {}),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ar: "/ar",
        en: "/en"
      }
    },
    openGraph: {
      title,
      description,
      locale: locale === "ar" ? "ar_EG" : "en_US",
      type: "website",
      images: [DEFAULT_OG_IMAGE]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE]
    },
    robots: {
      index: true,
      follow: true
    }
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;

  const locale: Locale = isLocale(localeParam) ? localeParam : "ar";
  const dictionary = getDictionary(locale);
  const settings = await getSettings(locale);
  const siteName = getSiteName(settings, dictionary);
  const siteDescription = getSiteDescription(
    settings,
    locale,
    dictionary
  );

  const cookieStore = await cookies();

  const initialUser = parseCachedUserCookie<ApiUser>(
    cookieStore.get(USER_CACHE_COOKIE)?.value
  );

  const initialMyAccess = parseCachedMyAccessCookie(
    cookieStore.get(MY_ACCESS_CACHE_COOKIE)?.value
  );

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    description: siteDescription,
    url: `https://nadi-community.com/${locale}`
  };

  return (
    <html
      lang={locale}
      dir={dir(locale)}
      data-scroll-behavior="smooth"
      className={`${jakarta.variable} ${plexSansArabic.variable} ${plexMono.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://ui-avatars.com" />
        <link rel="preconnect" href="https://admin.nadi-community.com" />
      </head>

      <body>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd)
          }}
        />

        <MotionConfig reducedMotion="user">
          <AuthProvider
            locale={locale}
            initialUser={initialUser}
            initialMyAccess={initialMyAccess}
            initialSettings={settings}
          >
            <ToastProvider>
              <div className="flex min-h-screen flex-col">
                <Navbar locale={locale} dict={dictionary} />
                <main className="flex-1">{children}</main>
                <Footer locale={locale} dict={dictionary} />
                <ScrollToTopButton />
              </div>
            </ToastProvider>
          </AuthProvider>
        </MotionConfig>
      </body>
    </html>
  );
}