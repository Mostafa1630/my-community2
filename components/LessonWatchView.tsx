"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, ArrowRight, Download, FileText } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { dir } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { LessonVideo } from "@/lib/api-types";
import { useAuth } from "@/lib/auth-context";
import VideoPlayer from "./VideoPlayer";
import PageLoader from "./PageLoader";
import EmptyState from "./EmptyState";

// GET /lessons/{id} is called only from here, client-side, after mount —
// never passed down as a prop from a server-rendered page — so the real
// video url never sits in this page's static HTML/RSC payload, only ever
// showing up once an authenticated viewer actually opens this lesson.
export default function LessonWatchView({
  lessonId,
  courseId,
  locale,
  dict
}: {
  lessonId: string;
  courseId: string;
  locale: Locale;
  dict: Dictionary;
}) {
  const { hydrated, getLessonVideo } = useAuth();
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<LessonVideo | null>(null);
  const [failed, setFailed] = useState(false);
  const BackIcon = dir(locale) === "rtl" ? ArrowRight : ArrowLeft;

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    setLoading(true);
    getLessonVideo(lessonId, locale).then((res) => {
      if (cancelled) return;
      if (!res) setFailed(true);
      else setLesson(res);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [lessonId, locale, hydrated, getLessonVideo]);

  const backLink = (
    <Link
      href={`/${locale}/courses/${courseId}`}
      className="mb-5 flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
    >
      <BackIcon size={16} />
      {dict.courseDetails.backToCourse}
    </Link>
  );

  if (!hydrated || loading) return <PageLoader />;

  if (failed || !lesson) {
    return (
      <div className="container-page mx-auto max-w-2xl py-8">
        {backLink}
        <EmptyState icon={AlertCircle} title={dict.courseDetails.lessonLoadError} />
      </div>
    );
  }

  return (
    <div className="container-page mx-auto max-w-3xl py-8">
      {backLink}
      <VideoPlayer url={lesson.videoUrl} title={lesson.title} />
      <h1 className="mt-5 text-xl font-bold text-ink">{lesson.title}</h1>
      {lesson.description && <p className="mt-2 text-sm leading-6 text-ink/70">{lesson.description}</p>}

      {lesson.attachments.length > 0 && (
        <div className="mt-6 space-y-2">
          <h2 className="text-sm font-semibold text-ink">{dict.courseDetails.lessonResourceTitle}</h2>
          {lesson.attachments.map((a, i) => (
            <a
              key={i}
              href={a.path}
              download={a.name}
              className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-4 py-3 text-sm hover:border-primary-200"
            >
              <FileText size={16} className="shrink-0 text-primary-600" />
              <span className="min-w-0 flex-1 truncate text-ink">{a.name}</span>
              <span className="shrink-0 text-xs text-ink/50">{a.size}</span>
              <Download size={14} className="shrink-0 text-ink/50" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
