"use client";

import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import { usePlatformStore } from "@/lib/platform-store";
import { categories, getCommunityByCreatorId } from "@/lib/data";
import CourseForm from "./CourseForm";

export default function NewCourseView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { user } = useAuth();
  const store = usePlatformStore();
  if (!user || user.role !== "creator") return null;

  const community =
    store.communities.all.find((c) => c.creatorId === user.id) ?? getCommunityByCreatorId(user.id);

  return (
    <CourseForm
      mode="new"
      categories={categories}
      locale={locale}
      dict={dict}
      cancelHref={`/${locale}/creator/courses`}
      onSave={(data) => {
        const id = `course-local-${Date.now()}`;
        const now = new Date().toISOString();
        store.courses.add({
          id,
          slug: `${data.titleEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "course"}-${Date.now().toString().slice(-4)}`,
          creatorId: user.id,
          communityId: community?.id ?? null,
          lessons: [],
          studentsCount: 0,
          ratingAverage: 0,
          discountPercentage: 0,
          createdAt: now,
          updatedAt: now,
          ...data
        });
      }}
    />
  );
}
