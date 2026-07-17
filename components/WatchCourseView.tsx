"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Lock, PlayCircle, FileText, Download } from "lucide-react";
import type { Course } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import { getCommunityById } from "@/lib/data";
import VideoPlayer from "./VideoPlayer";
import EmptyState from "./EmptyState";

export default function WatchCourseView({
  course,
  locale,
  dict
}: {
  course: Course;
  locale: Locale;
  dict: Dictionary;
}) {
  const { role, isSubscribed, ownsCourseStandalone } = useAuth();
  const [activeLessonId, setActiveLessonId] = useState(course.lessons[0]?.id);

  const owned =
    role === "student" &&
    (course.communityId ? isSubscribed(course.communityId) : ownsCourseStandalone(course.id));
  const activeLesson = course.lessons.find((l) => l.id === activeLessonId) ?? course.lessons[0];

  if (!owned) {
    const community = course.communityId ? getCommunityById(course.communityId) : undefined;
    const backHref = community
      ? `/${locale}/communities/${community.slug}/courses/${course.slug}`
      : `/${locale}/communities`;
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={Lock}
          title={dict.courseDetails.lessonLocked}
          action={
            <Link
              href={backHref}
              className="rounded-full bg-primary-500 px-4 py-2 text-sm font-medium text-white"
            >
              {dict.common.viewDetails}
            </Link>
          }
        />
      </div>
    );
  }

  const title = locale === "ar" ? course.titleAr : course.titleEn;
  const activeTitle = activeLesson ? (locale === "ar" ? activeLesson.titleAr : activeLesson.titleEn) : "";
  const activeDesc = activeLesson ? (locale === "ar" ? activeLesson.descAr : activeLesson.descEn) : "";

  return (
    <div className="container-page grid gap-6 py-8 lg:grid-cols-[1fr,320px]">
      <div>
        <p className="mb-1 text-xs font-medium text-primary-700">{title}</p>
        {activeLesson && (
          <>
            {activeLesson.videoUrl ? (
              <VideoPlayer url={activeLesson.videoUrl} title={activeTitle} />
            ) : activeLesson.resourceFileUrl ? (
              <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-surface shadow-card">
                <FileText size={32} className="text-primary-600" />
                <p className="text-sm font-medium text-ink">{dict.courseDetails.lessonResourceTitle}</p>
                <a
                  href={activeLesson.resourceFileUrl}
                  download={activeLesson.resourceFileName}
                  className="flex items-center gap-2 rounded-full bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600"
                >
                  <Download size={14} />
                  {dict.courseDetails.downloadResource}
                </a>
              </div>
            ) : null}
            <h1 className="mt-5 text-xl font-bold text-ink">{activeTitle}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/70">{activeDesc}</p>
          </>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/45">
          {dict.student.watchLessons}
        </h2>
        <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
          {course.lessons.map((lesson, i) => {
            const lessonTitle = locale === "ar" ? lesson.titleAr : lesson.titleEn;
            const isActive = lesson.id === activeLesson?.id;
            return (
              <button
                key={lesson.id}
                onClick={() => setActiveLessonId(lesson.id)}
                className={`flex w-full items-center gap-3 px-4 py-3.5 text-start transition ${
                  isActive ? "bg-primary-50" : "hover:bg-ink/[0.02]"
                }`}
              >
                {isActive ? (
                  <PlayCircle size={18} className="shrink-0 text-primary-600" />
                ) : (
                  <CheckCircle2 size={18} className="shrink-0 text-ink/25" />
                )}
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-medium ${isActive ? "text-primary-700" : "text-ink"}`}>
                    {i + 1}. {lessonTitle}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-xs text-ink/40">{lesson.durationMinutes}m</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
