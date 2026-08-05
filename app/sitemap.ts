import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { getCreators, getCommunities } from "@/lib/api-content";

const BASE_URL = "https://nadi-community.com";

// Creator and community routes are both keyed by real numeric id now
// (/creators/{id}, /communities/{id} — neither uses a local slug anymore),
// so both sets of sitemap entries come from the real API, walking every page
// via `lastPage`. The nested local-mock course-in-community pages
// (/communities/{slug}/courses/{courseSlug}) are deliberately left out here —
// they're only reachable from a local mock subscription, which nothing in the
// app can actually create anymore now that auth is real (see auth-context.tsx/
// MyCommunitiesView — the local demo role-switcher that used to seed those
// subscriptions is gone). Both getCreators()/getCommunities() fail soft (empty
// page) while NEXT_PUBLIC_API_BASE_URL is unset, so this loop just runs once
// and contributes nothing until a real backend is reachable.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["", "/creators", "/login", "/register"];
  const lastModified = new Date();

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of staticPaths) {
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified,
        changeFrequency: path === "" ? "daily" : "weekly",
        priority: path === "" ? 1 : 0.7
      });
    }

    let creatorPage = 1;
    let creatorLastPage = 1;
    do {
      const result = await getCreators(locale, creatorPage);
      creatorLastPage = result.lastPage;
      for (const creator of result.items) {
        entries.push({
          url: `${BASE_URL}/${locale}/creators/${creator.id}`,
          lastModified,
          changeFrequency: "weekly",
          priority: 0.6
        });
      }
      creatorPage += 1;
    } while (creatorPage <= creatorLastPage);

    let communityPage = 1;
    let communityLastPage = 1;
    do {
      const result = await getCommunities(locale, { page: communityPage });
      communityLastPage = result.lastPage;
      for (const community of result.items) {
        entries.push({
          url: `${BASE_URL}/${locale}/communities/${community.id}`,
          lastModified,
          changeFrequency: "weekly",
          priority: 0.8
        });
      }
      communityPage += 1;
    } while (communityPage <= communityLastPage);
  }

  return entries;
}
