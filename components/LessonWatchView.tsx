"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, ArrowRight, Download, FileText } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { dir } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { CourseDetails, LessonVideo } from "@/lib/api-types";
import { useAuth } from "@/lib/auth-context";
import { useCourseEnrollment } from "@/lib/use-details-access";
import VideoPlayer from "./VideoPlayer";
import CourseLessonSidebar from "./CourseLessonSidebar";
import PageLoader from "./PageLoader";
import EmptyState from "./EmptyState";

export default function LessonWatchView({
  courseId,
  lessonId,
  locale,
  dict,
}: {
  courseId: string;
  lessonId: string;
  locale: Locale;
  dict: Dictionary;
}) {
  const { hydrated, role, user, getLessonVideo, fetchCourseDetails } = useAuth();
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<LessonVideo | null>(null);
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [failed, setFailed] = useState(false);
  const { enrolled, resolved: enrollmentResolved } = useCourseEnrollment(
    courseId,
    locale,
    course?.isEnrolled ?? false,
  );
  const BackIcon = dir(locale) === "rtl" ? ArrowRight : ArrowLeft;

  const unlocked =
    (role === "creator" && user?.id === course?.creator.id) ||
    role === "admin" ||
    (role === "student" && enrolled);

  const accessReady = role !== "student" || enrollmentResolved;

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    setLoading(true);
    setFailed(false);

    Promise.all([getLessonVideo(lessonId, locale), fetchCourseDetails(courseId, locale)]).then(
      ([video, details]) => {
        if (cancelled) return;
        if (!video) setFailed(true);
        else setLesson(video);
        if (details) setCourse(details);
        setLoading(false);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [lessonId, courseId, locale, hydrated, getLessonVideo, fetchCourseDetails]);

  const backLink = (
    <Link
      href={`/${locale}/courses/${courseId}`}
      className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
    >
      <BackIcon size={16} />
      {dict.courseDetails.backToCourse}
    </Link>
  );

  if (!hydrated || loading) return <PageLoader />;

  if (failed || !lesson) {
    return (
      <div className="container-page py-8">
        <div className="mx-auto max-w-2xl">
          {backLink}
          <EmptyState icon={AlertCircle} title={dict.courseDetails.lessonLoadError} />
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      {backLink}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr),minmax(320px,400px)] lg:items-start lg:gap-10">
        <div className="min-w-0">
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

        {course && course.lessons.length > 0 && (
          <div className="mt-8 min-w-0 lg:mt-0">
            <CourseLessonSidebar
              courseId={courseId}
              lessons={course.lessons}
              locale={locale}
              dict={dict}
              activeLessonId={lessonId}
              isLessonOpen={(item) => !!lesson || item.isFree || (unlocked && accessReady)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
