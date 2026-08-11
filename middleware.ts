import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale, isLocale } from "@/lib/i18n/config";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (pathnameHasLocale) return NextResponse.next();

  // Skip static assets, API-ish paths, and Next's generated metadata routes
  // (icon/apple-icon/opengraph-image have no file extension in their URL path,
  // so the dot-check above doesn't catch them — without this they'd otherwise
  // get redirected to a non-existent /en/icon and 404). Route Handlers under
  // /api must also be skipped — without this, a client fetch("/api/...")
  // would get redirected to /en/api/... (or /ar/...) and break.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname === "/icon" ||
    pathname === "/apple-icon"
  ) {
    return NextResponse.next();
  }

  // New visitors (no NEXT_LOCALE cookie yet) land on the default locale
  // (English) regardless of their browser's Accept-Language — the client
  // wants English as the site's first impression. A returning visitor who
  // has already picked a language via the navbar toggle (Navbar.tsx writes
  // this cookie alongside the localStorage copy — localStorage itself
  // isn't readable here, this runs at the edge before any page loads)
  // lands back on that language instead, with no client-side flash/redirect.
  const storedLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const targetLocale = storedLocale && isLocale(storedLocale) ? storedLocale : defaultLocale;
  const url = request.nextUrl.clone();
  url.pathname = `/${targetLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"]
};
