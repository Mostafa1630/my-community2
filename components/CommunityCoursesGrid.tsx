"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import type { Community, Course } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import CourseInCommunityCard from "./CourseInCommunityCard";
import EmptyState from "./EmptyState";
import Pagination from "./Pagination";
import Reveal from "./motion/Reveal";

const PAGE_SIZE = 4;

export default function CommunityCoursesGrid({
  courses,
  community,
  locale,
  dict
}: {
  courses: Course[];
  community: Community;
  locale: Locale;
  dict: Dictionary;
}) {
  const [page, setPage] = useState(1);

  if (courses.length === 0) {
    return <EmptyState icon={BookOpen} title={dict.common.empty} />;
  }

  // Seed communities only have 1-2 published courses each, which never fills a page —
  // repeated here (display only, not the underlying data) purely so pagination has
  // something to paginate through. Drop this once communities have enough real courses.
  const reps = courses.length > PAGE_SIZE ? [0] : [0, 1, 2];
  const displayCourses = reps.flatMap((rep) => courses.map((course) => ({ course, key: `${course.id}-${rep}` })));

  const totalPages = Math.max(1, Math.ceil(displayCourses.length / PAGE_SIZE));
  const paged = displayCourses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {paged.map(({ course, key }, i) => (
          <Reveal key={key} index={i}>
            <CourseInCommunityCard course={course} community={community} locale={locale} dict={dict} />
          </Reveal>
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} dict={dict} />
    </div>
  );
}
