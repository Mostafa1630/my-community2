"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import { usePlatformStore } from "@/lib/platform-store";
import { getCourseById, getCommunityById } from "@/lib/data";
import CommunityCard from "./CommunityCard";
import CourseInCommunityCard from "./CourseInCommunityCard";
import EmptyState from "./EmptyState";
import Reveal from "./motion/Reveal";

type Tab = "communities" | "courses";

export default function FavoritesView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { user } = useAuth();
  const store = usePlatformStore();
  const [tab, setTab] = useState<Tab>("communities");

  if (!user) {
    return <EmptyState icon={Heart} title={dict.common.empty} />;
  }

  const myFavorites = store.favorites.all.filter((f) => f.userId === user.id);
  const communityFavorites = myFavorites.filter((f) => f.favoritableType === "community");
  const courseFavorites = myFavorites.filter((f) => f.favoritableType === "course");
  const active = tab === "communities" ? communityFavorites : courseFavorites;

  return (
    <div>
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setTab("communities")}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
            tab === "communities" ? "border-primary-500 bg-primary-500 text-white" : "border-line text-ink/60"
          }`}
        >
          {dict.favorites.tabCommunities} ({communityFavorites.length})
        </button>
        <button
          onClick={() => setTab("courses")}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
            tab === "courses" ? "border-primary-500 bg-primary-500 text-white" : "border-line text-ink/60"
          }`}
        >
          {dict.favorites.tabCourses} ({courseFavorites.length})
        </button>
      </div>

      {active.length === 0 ? (
        <EmptyState icon={Heart} title={dict.favorites.empty} />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {active.map((fav, i) => {
            if (fav.favoritableType === "community") {
              const community =
                store.communities.all.find((c) => c.id === fav.favoritableId) ?? getCommunityById(fav.favoritableId);
              if (!community) return null;
              return (
                <Reveal key={fav.id} index={i}>
                  <CommunityCard community={community} locale={locale} dict={dict} />
                </Reveal>
              );
            }

            const course = store.courses.all.find((c) => c.id === fav.favoritableId) ?? getCourseById(fav.favoritableId);
            if (!course) return null;
            const community = course.communityId
              ? store.communities.all.find((c) => c.id === course.communityId) ?? getCommunityById(course.communityId)
              : undefined;
            return (
              <Reveal key={fav.id} index={i}>
                <CourseInCommunityCard course={course} community={community} locale={locale} dict={dict} />
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
