import type { MetadataRoute } from "next";

// Private/account-gated routes (profile, favorites, learn, creator/*, community feeds)
// are intentionally NOT disallowed here. Every one of those pages
// already sets `robots: { index: false }` in its own generateMetadata — blocking them
// in robots.txt as well would stop crawlers from ever reaching that noindex tag, which
// is the exact anti-pattern Google's own docs warn against ("don't combine disallow
// with noindex"). Letting crawlers in lets them read and honor the noindex directive.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/"
      }
    ],
    sitemap: "https://nadi-community.com/sitemap.xml"
  };
}
