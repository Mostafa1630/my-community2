"use client";

import { BookX } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import { usePlatformStore } from "@/lib/platform-store";
import { categories } from "@/lib/data";
import CourseForm from "./CourseForm";
import EmptyState from "./EmptyState";

export default function EditCourseView({
  courseId,
  locale,
  dict
}: {
  courseId: string;
  locale: Locale;
  dict: Dictionary;
}) {
  const { user } = useAuth();
  const store = usePlatformStore();
  const course = store.courses.all.find((c) => c.id === courseId);

  if (!user || user.role !== "creator") return null;
  if (!course || course.creatorId !== user.id) {
    return <EmptyState icon={BookX} title={dict.common.empty} />;
  }

  return (
    <CourseForm
      mode="edit"
      initial={course}
      categories={categories}
      locale={locale}
      dict={dict}
      cancelHref={`/${locale}/creator/courses`}
      onSave={(data) => store.courses.update(courseId, { ...data, updatedAt: new Date().toISOString() })}
    />
  );
}
