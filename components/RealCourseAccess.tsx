"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck, Tag, Zap } from "lucide-react";
import type { CourseDetails } from "@/lib/api-types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { t } from "@/lib/i18n/t";
import { useAuth } from "@/lib/auth-context";
import { useCourseEnrollment } from "@/lib/use-details-access";
import { ApiError } from "@/lib/api-client";
import { formatPrice } from "@/lib/format";
import VideoPlayer from "./VideoPlayer";
import CourseLessonSidebar from "./CourseLessonSidebar";

function CourseBenefitItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-xs leading-5 text-ink/70">
      <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-success" />
      <span>{children}</span>
    </li>
  );
}

function CourseAccessCardShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      {children}
    </div>
  );
}

function CourseAccessCardFooter({ children }: { children: ReactNode }) {
  return (
    <div className="border-t border-line bg-paper/30 px-5 py-4">
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

export default function RealCourseAccess({
  course,
  locale,
  dict,
}: {
  course: CourseDetails;
  locale: Locale;
  dict: Dictionary;
}) {
  const { role, user, checkCoupon, settings } = useAuth();
  const { enrolled, resolved: enrollmentResolved } = useCourseEnrollment(
    course.id,
    locale,
    course.isEnrolled,
  );
  const [couponCode, setCouponCode] = useState("");
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [couponResult, setCouponResult] = useState<{ discountPercentage: number } | null>(null);
  const [couponError, setCouponError] = useState("");

  const unlocked =
    (role === "creator" && user?.id === course.creator.id) ||
    role === "admin" ||
    (role === "student" && enrolled);

  const ownedStateReady = role !== "student" || enrollmentResolved;
  const accessLoading = !ownedStateReady;

  const hasCourseDiscount = !course.isFree && course.discountPercentage > 0;
  const finalWithCoupon = couponResult
    ? course.finalPrice * (1 - couponResult.discountPercentage / 100)
    : course.finalPrice;
  const showOldPrice = !course.isFree && (hasCourseDiscount || !!couponResult);

  async function handleCheckCoupon() {
    if (!couponCode.trim()) return;
    setCheckingCoupon(true);
    setCouponError("");
    setCouponResult(null);
    try {
      const result = await checkCoupon({ creatorId: course.creator.id, code: couponCode.trim() }, locale);
      setCouponResult({ discountPercentage: result.discountPercentage });
    } catch (error) {
      setCouponError(error instanceof ApiError ? error.message : dict.communityDetails.couponInvalid);
    } finally {
      setCheckingCoupon(false);
    }
  }

  const checkoutHref = couponResult
    ? `/${locale}/courses/${course.id}/checkout?coupon=${encodeURIComponent(couponCode.trim())}`
    : `/${locale}/courses/${course.id}/checkout`;

  const courseBenefits = (
    <ul className="space-y-2">
      <CourseBenefitItem>{dict.courseDetails.tagInstantAccess}</CourseBenefitItem>
      <CourseBenefitItem>{dict.courseDetails.tagFullLessons}</CourseBenefitItem>
      <CourseBenefitItem>{dict.courseDetails.tagSecurePayment}</CourseBenefitItem>
    </ul>
  );

  const primaryButtonClass =
    "flex w-full items-center justify-center rounded-full py-2.5 text-sm font-semibold transition";
  const secondaryButtonClass =
    "flex w-full items-center justify-center rounded-full border border-line py-2.5 text-sm font-semibold text-ink/70 transition hover:border-primary-300 hover:text-primary-700";

  const accessCard = !ownedStateReady ? (
    <CourseAccessCardShell>
      <div className="border-b border-line bg-paper/60 px-5 py-4">
        <div className="h-3 w-24 animate-pulse rounded bg-line/60" />
        <div className="mt-3 h-8 w-32 animate-pulse rounded bg-line/60" />
      </div>
      <div className="space-y-3 px-5 py-4">
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-line/50" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-line/50" />
          <div className="h-3 w-3/5 animate-pulse rounded bg-line/50" />
        </div>
      </div>
      <CourseAccessCardFooter>
        <div className="h-10 w-full animate-pulse rounded-full bg-line/60" />
        <div className="h-10 w-full animate-pulse rounded-full bg-line/40" />
      </CourseAccessCardFooter>
    </CourseAccessCardShell>
  ) : unlocked ? (
    <CourseAccessCardShell>
      <div className="px-5 py-5">
        <div className="flex items-start gap-3 rounded-xl border border-success/20 bg-success/5 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 size={20} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink">{dict.courseDetails.alreadyOwned}</p>
            <p className="mt-1 text-xs leading-5 text-ink/60">{dict.courseDetails.alreadyOwnedSubtitle}</p>
          </div>
        </div>
      </div>
      <CourseAccessCardFooter>
        {course.lessons[0] && (
          <Link
            href={`/${locale}/courses/${course.id}/lessons/${course.lessons[0].id}`}
            className={`${primaryButtonClass} bg-primary-500 text-white hover:bg-primary-600`}
          >
            {dict.common.continueLearning}
          </Link>
        )}
        <Link href={`/${locale}/communities/${course.community.id}`} className={secondaryButtonClass}>
          {dict.communityDetails.backToCommunity}
        </Link>
      </CourseAccessCardFooter>
    </CourseAccessCardShell>
  ) : (
    <CourseAccessCardShell>
      <div className="border-b border-line bg-paper/60 px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/50">
          {dict.courseDetails.checkoutTitle}
        </p>
        <div className="mt-1.5 flex flex-wrap items-baseline gap-2">
          <p className="font-mono text-2xl font-black tracking-tight text-ink">
            {course.isFree ? dict.communities.freeBadge : formatPrice(finalWithCoupon, locale, settings?.currency)}
          </p>
          {showOldPrice && (
            <p className="font-mono text-sm text-ink/55 line-through">
              {formatPrice(course.price, locale, settings?.currency)}
            </p>
          )}
          {hasCourseDiscount && (
            <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[11px] font-bold text-danger">
              -{course.discountPercentage}%
            </span>
          )}
          {couponResult && (
            <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-bold text-success">
              -{couponResult.discountPercentage}%
            </span>
          )}
        </div>
        {!course.isFree && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-ink/55">
            <Zap size={12} className="text-accent-600" />
            {dict.courseDetails.tagInstantAccess}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4 px-5 py-4">
        {!course.isFree && (
          <div className="rounded-xl border border-accent-200/80 bg-accent-50/40 p-3.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-accent-900">
              <Tag size={13} />
              {dict.communityDetails.couponLabel}
            </label>
            <p className="mt-1 text-[11px] leading-5 text-ink/55">{dict.communityDetails.couponHint}</p>
            <div className="mt-2.5 flex gap-2">
              <input
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  setCouponResult(null);
                  setCouponError("");
                }}
                dir="ltr"
                placeholder={dict.communityDetails.couponPlaceholder}
                className="min-w-0 flex-1 rounded-xl border border-accent-200 bg-surface px-3 py-2 text-xs font-mono outline-none focus:border-accent-400"
              />
              <button
                type="button"
                onClick={handleCheckCoupon}
                disabled={checkingCoupon || !couponCode.trim()}
                className="flex shrink-0 items-center gap-1 rounded-xl bg-accent-500 px-3.5 py-2 text-xs font-semibold text-ink transition hover:bg-accent-400 disabled:opacity-60"
              >
                {checkingCoupon && <Loader2 size={13} className="animate-spin" />}
                {dict.communityDetails.couponApplyButton}
              </button>
            </div>
            {couponResult && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-success">
                <CheckCircle2 size={13} />
                {dict.communityDetails.couponApplied}
              </p>
            )}
            {couponError && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-danger">
                <AlertCircle size={13} />
                {couponError}
              </p>
            )}
          </div>
        )}

        <div>
          <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink/45">
            <ShieldCheck size={12} />
            {dict.courseDetails.whatYouGet}
          </p>
          {courseBenefits}
        </div>
      </div>

      <CourseAccessCardFooter>
        {role === "student" && (
          <Link
            href={checkoutHref}
            className={`${primaryButtonClass} bg-accent-500 text-ink hover:bg-accent-400`}
          >
            {course.isFree
              ? dict.communityDetails.freeSubscribe
              : t(dict.courseDetails.buyThisCourseFor, {
                  price: formatPrice(finalWithCoupon, locale, settings?.currency),
                })}
          </Link>
        )}
        <Link href={`/${locale}/communities/${course.community.id}`} className={secondaryButtonClass}>
          {dict.communityDetails.backToCommunity}
        </Link>
      </CourseAccessCardFooter>
    </CourseAccessCardShell>
  );

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:grid-rows-[auto_auto] lg:items-start lg:gap-x-6 lg:gap-y-6">
      <div className="order-1 min-w-0 lg:col-start-1 lg:row-start-1">
        {course.introVideo ? (
          <VideoPlayer url={course.introVideo} title={course.title} />
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-2xl border border-line bg-white text-sm text-ink/65 shadow-card">
            {dict.common.empty}
          </div>
        )}
      </div>

      <div className="order-2 w-full min-w-0 lg:w-[20rem] lg:shrink-0 lg:col-start-2 lg:row-start-1">
        {accessCard}
      </div>

      <div className="order-3 min-w-0 lg:col-start-1 lg:row-start-2">
        <CourseLessonSidebar
          courseId={course.id}
          lessons={course.lessons}
          locale={locale}
          dict={dict}
          layout="stacked"
          isLessonOpen={(lesson) => (unlocked && !accessLoading) || lesson.isFree}
        />
      </div>
    </div>
  );
}
