"use client";

import { Lock, PlayCircle } from "lucide-react";
import type { Course } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";

export default function CourseCurriculum({
  course,
  unlocked,
  locale,
  dict
}: {
  course: Course;
  unlocked: boolean;
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-surface shadow-card">
      {course.lessons.map((lesson, i) => {
        const title = locale === "ar" ? lesson.titleAr : lesson.titleEn;
        const open = unlocked || lesson.isFree;
        return (
          <div key={lesson.id} className="flex items-center gap-3 px-4 py-3.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 font-mono text-xs font-semibold text-primary-700">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{title}</p>
              {!open && <p className="text-xs text-ink/40">{dict.courseDetails.lessonLocked}</p>}
            </div>
            <span className="text-xs text-ink/40 font-mono">{lesson.durationMinutes}m</span>
            {open ? (
              <PlayCircle size={18} className="text-primary-500" />
            ) : (
              <Lock size={16} className="text-ink/30" />
            )}
          </div>
        );
      })}
    </div>
  );
}
