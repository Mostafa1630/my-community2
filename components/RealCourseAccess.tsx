"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Lock, PlayCircle } from "lucide-react";
import type { CourseDetails } from "@/lib/api-types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { t } from "@/lib/i18n/t";
import { useAuth } from "@/lib/auth-context";
import VideoPlayer from "./VideoPlayer";

// Real per-lesson access control lives entirely on the frontend — GET
// /courses/details/{id} is a public endpoint that returns every lesson's real
// video url regardless of who's asking, only `is_free` says what's actually
// meant to be watchable. `isSubscribed` reads local mock subscription state
// (real community subscriptions aren't connected yet — see
// RealCommunitySubscribeCard), so it's always false for a real student today;
// this becomes real automatically once subscribing is wired up, same
// forward-compatible shape as every other partial-migration seam here.
export default function RealCourseAccess({
  course,
  locale,
  dict
}: {
  course: CourseDetails;
  locale: Locale;
  dict: Dictionary;
}) {
  const { role, user, isSubscribed } = useAuth();

  const unlocked =
    (role === "creator" && user?.id === course.creator.id) ||
    role === "admin" ||
    (role === "student" && isSubscribed(course.community.id));

  const firstOpenLesson = course.lessons.find((l) => unlocked || l.isFree) ?? null;
  const [activeLessonId, setActiveLessonId] = useState<string | null>(firstOpenLesson?.id ?? null);
  const activeLesson = course.lessons.find((l) => l.id === activeLessonId) ?? null;
  const activeUrl = activeLesson?.url ?? course.introVideo;
  const activeTitle = activeLesson?.title ?? course.title;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.6fr,1fr]">
      <div>
        <h2 className="mb-3 text-lg font-bold text-ink">{dict.courseDetails.curriculum}</h2>
        {activeUrl ? (
          <VideoPlayer url={activeUrl} title={activeTitle} />
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-2xl border border-line bg-ink/5 text-sm text-ink/40">
            {dict.common.empty}
          </div>
        )}

        <div className="mt-5 divide-y divide-line rounded-2xl border border-line bg-surface shadow-card">
          {course.lessons.map((lesson, i) => {
            const open = unlocked || lesson.isFree;
            const active = lesson.id === activeLessonId;
            return (
              <button
                key={lesson.id}
                type="button"
                disabled={!open}
                onClick={() => setActiveLessonId(lesson.id)}
                className={`flex w-full items-center gap-3 px-4 py-3.5 text-start transition ${
                  open ? "hover:bg-primary-50/60" : "cursor-not-allowed opacity-70"
                } ${active ? "bg-primary-50/70" : ""}`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 font-mono text-xs font-semibold text-primary-700">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{lesson.title}</span>
                  {!open && <span className="block text-xs text-ink/40">{dict.courseDetails.lessonLocked}</span>}
                </span>
                {open ? (
                  <PlayCircle size={18} className={active ? "text-primary-600" : "text-primary-500"} />
                ) : (
                  <Lock size={16} className="text-ink/30" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="sticky top-24 rounded-2xl border border-line bg-surface p-5 shadow-card">
          {unlocked ? (
            <p className="flex items-center gap-1.5 text-sm font-medium text-success">
              <CheckCircle2 size={16} />
              {dict.courseDetails.alreadyOwned}
            </p>
          ) : (
            <>
              <p className="flex items-center gap-1.5 text-sm text-ink/60">
                <Lock size={15} />
                {t(dict.courseDetails.subscribeToUnlock, { name: course.community.name })}
              </p>
              <Link
                href={`/${locale}/communities/${course.community.id}`}
                className="mt-4 flex w-full items-center justify-center rounded-full bg-accent-500 py-3 text-sm font-semibold text-ink transition hover:bg-accent-400"
              >
                {dict.communityDetails.backToCommunity}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
