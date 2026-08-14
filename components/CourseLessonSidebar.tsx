import Link from "next/link";
import { Lock, PlayCircle } from "lucide-react";
import type { CourseLesson } from "@/lib/api-types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";

export default function CourseLessonSidebar({
  courseId,
  lessons,
  locale,
  dict,
  activeLessonId,
  isLessonOpen,
  layout = "sidebar",
  className = "",
}: {
  courseId: string;
  lessons: CourseLesson[];
  locale: Locale;
  dict: Dictionary;
  activeLessonId?: string;
  isLessonOpen: (lesson: CourseLesson) => boolean;
  layout?: "sidebar" | "stacked";
  className?: string;
}) {
  if (lessons.length === 0) return null;

  const shellClass =
    layout === "stacked"
      ? "flex max-h-[min(50vh,28rem)] min-h-[12rem] flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card"
      : "flex h-full min-h-[min(60vh,32rem)] max-h-[min(60vh,32rem)] flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:min-h-0";

  return (
    <aside className={`${shellClass} ${className}`}>
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-sm font-bold text-ink">{dict.courseDetails.curriculum}</h2>
        <p className="mt-0.5 text-[11px] text-ink/55">
          {lessons.length} {dict.common.lessons}
        </p>
      </div>
      <div className="min-h-0 flex-1 divide-y divide-line/70 overflow-y-auto overscroll-contain">
        {lessons.map((lesson, i) => {
          const isActive = activeLessonId === lesson.id;
          const open = isLessonOpen(lesson);
          const row = (
            <>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-semibold ring-1 ${
                  isActive
                    ? "bg-primary-500 text-white ring-primary-500"
                    : "bg-primary-50 text-primary-700 ring-primary-100/70"
                }`}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 py-0.5">
                <span
                  className={`block truncate text-sm ${isActive ? "font-bold text-ink" : "font-medium text-ink/80"}`}
                >
                  {lesson.title}
                </span>
              </span>
              {open ? (
                <PlayCircle
                  size={16}
                  className={`shrink-0 ${isActive ? "text-primary-600" : "text-primary-400"}`}
                />
              ) : (
                <Lock size={14} className="shrink-0 text-ink/45" />
              )}
            </>
          );

          const rowClass = `flex w-full items-center gap-3 px-5 py-3.5 text-start transition ${
            isActive ? "bg-primary-50" : "hover:bg-paper"
          }`;

          if (open) {
            return (
              <Link
                key={lesson.id}
                href={`/${locale}/courses/${courseId}/lessons/${lesson.id}`}
                aria-current={isActive ? "page" : undefined}
                className={rowClass}
              >
                {row}
              </Link>
            );
          }

          return (
            <span key={lesson.id} className={`${rowClass} cursor-not-allowed opacity-60`}>
              {row}
            </span>
          );
        })}
      </div>
    </aside>
  );
}
