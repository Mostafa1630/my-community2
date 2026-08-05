import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n/config";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (pathnameHasLocale) return NextResponse.next();

  // Skip static assets, API-ish paths, and Next's generated metadata routes
  // (icon/apple-icon/opengraph-image have no file extension in their URL path,
  // so the dot-check above doesn't catch them — without this they'd otherwise
  // get redirected to a non-existent /en/icon and 404).
  if (
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    pathname === "/icon" ||
    pathname === "/apple-icon"
  ) {
    return NextResponse.next();
  }

  // Always land new visitors on the default locale (English) regardless of their
  // browser's Accept-Language — the client wants English as the site's first
  // impression; visitors can still switch manually via the navbar language toggle.
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"]
};
