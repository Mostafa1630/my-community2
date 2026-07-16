"use client";

import Link from "next/link";
import { CheckCircle2, Lock } from "lucide-react";
import type { Community, Course } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { t } from "@/lib/i18n/t";
import { useAuth } from "@/lib/auth-context";
import CourseCurriculum from "./CourseCurriculum";

export default function CourseCommunityAccess({
  course,
  community,
  locale,
  dict
}: {
  course: Course;
  community: Community;
  locale: Locale;
  dict: Dictionary;
}) {
  const { role, user, isSubscribed } = useAuth();

  const unlocked =
    (role === "student" && isSubscribed(community.id)) ||
    (role === "creator" && user?.id === community.creatorId) ||
    role === "admin";

  const creatorName = locale === "ar" ? community.nameAr : community.nameEn;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.6fr,1fr]">
      <div>
        <h2 className="mb-3 text-lg font-bold text-ink">{dict.courseDetails.curriculum}</h2>
        <CourseCurriculum course={course} unlocked={unlocked} locale={locale} dict={dict} />
      </div>
      <div>
        <div className="sticky top-24 rounded-2xl border border-line bg-surface p-5 shadow-card">
          {unlocked ? (
            <>
              <p className="flex items-center gap-1.5 text-sm font-medium text-success">
                <CheckCircle2 size={16} />
                {dict.courseDetails.alreadyOwned}
              </p>
              <Link
                href={`/${locale}/learn/${course.slug}`}
                className="mt-4 flex w-full items-center justify-center rounded-full bg-primary-500 py-3 text-sm font-semibold text-white transition hover:bg-primary-600"
              >
                {dict.common.continueLearning}
              </Link>
            </>
          ) : (
            <>
              <p className="flex items-center gap-1.5 text-sm text-ink/60">
                <Lock size={15} />
                {t(dict.courseDetails.subscribeToUnlock, { name: creatorName })}
              </p>
              <Link
                href={`/${locale}/communities/${community.slug}`}
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
