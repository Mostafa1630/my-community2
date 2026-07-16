import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { activeCommunities, getCoursesByCommunity, creators } from "@/lib/data";

const BASE_URL = "https://mujtamaaty.example";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/communities", "/login", "/register"];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of staticPaths) {
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        changeFrequency: path === "" ? "daily" : "weekly",
        priority: path === "" ? 1 : 0.7
      });
    }
    for (const community of activeCommunities) {
      entries.push({
        url: `${BASE_URL}/${locale}/communities/${community.slug}`,
        changeFrequency: "weekly",
        priority: 0.8
      });
      for (const course of getCoursesByCommunity(community.id).filter((c) => c.status === "published")) {
        entries.push({
          url: `${BASE_URL}/${locale}/communities/${community.slug}/courses/${course.slug}`,
          changeFrequency: "weekly",
          priority: 0.7
        });
      }
    }
    for (const creator of creators) {
      entries.push({
        url: `${BASE_URL}/${locale}/creators/${creator.slug}`,
        changeFrequency: "weekly",
        priority: 0.6
      });
    }
  }

  return entries;
}
