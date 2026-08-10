"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { CourseSummary } from "@/lib/api-types";
import { useAuth } from "@/lib/auth-context";
import RealCourseCard from "./RealCourseCard";
import Pagination from "./Pagination";
import EmptyState from "./EmptyState";
import PageLoader from "./PageLoader";

// GET /courses/my-courses — the student's own individually-purchased
// standalone courses (via POST /courses/{id}/enroll), separate from
// whatever comes bundled with a community subscription.
export default function MyCoursesView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { hydrated, role, getMyEnrolledCourses } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CourseSummary[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    if (!hydrated || role !== "student") {
      if (hydrated) setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getMyEnrolledCourses(locale, page)
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setLastPage(res.lastPage);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, role, locale, page]);

  if (!hydrated || loading) return <PageLoader />;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title={dict.student.noCourses}
        action={
          <Link
            href={`/${locale}`}
            className="rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
          >
            {dict.student.browseCommunities}
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((course, i) => (
          <RealCourseCard key={course.id} course={course} locale={locale} dict={dict} priority={i < 4} />
        ))}
      </div>
      <Pagination page={page} totalPages={lastPage} onChange={setPage} dict={dict} />
    </div>
  );
}
