"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import type { CourseDetails } from "@/lib/api-types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { dir } from "@/lib/i18n/config";
import { useAuth } from "@/lib/auth-context";
import { formatPrice } from "@/lib/format";

// Mirrors CommunityCheckoutView exactly — same Kashier-hosted checkout
// session pattern, just POST /courses/{id}/enroll instead of
// /communities/{id}/subscribe, for buying a single course outright rather
// than subscribing to its whole community.
export default function CourseCheckoutView({
  course,
  locale,
  dict,
  initialCouponCode
}: {
  course: CourseDetails;
  locale: Locale;
  dict: Dictionary;
  initialCouponCode?: string;
}) {
  const router = useRouter();
  const { checkCoupon, createCourseEnrollment, settings } = useAuth();
  const [couponResult, setCouponResult] = useState<{ discountPercentage: number } | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(!!initialCouponCode);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    // Always goes through the real endpoint and redirects to whatever
    // payment_url comes back — free courses still return one, same as
    // communities, so there's no local skip-straight-through shortcut here.
    setError("");
    setConfirming(true);
    try {
      const session = await createCourseEnrollment(
        course.id,
        couponResult ? initialCouponCode : undefined,
        locale
      );
      window.location.href = session.paymentUrl;
    } catch {
      setError(dict.communityDetails.paymentError);
      setConfirming(false);
    }
  }

  useEffect(() => {
    if (!initialCouponCode) return;
    checkCoupon({ creatorId: course.creator.id, code: initialCouponCode }, locale)
      .then((result) => setCouponResult({ discountPercentage: result.discountPercentage }))
      .catch(() => setCouponResult(null))
      .finally(() => setCheckingCoupon(false));
  }, [initialCouponCode, course.creator.id, locale, checkCoupon]);

  const hasCourseDiscount = !course.isFree && course.discountPercentage > 0;
  const finalWithCoupon = couponResult
    ? course.finalPrice * (1 - couponResult.discountPercentage / 100)
    : course.finalPrice;
  const showOldPrice = !course.isFree && (hasCourseDiscount || !!couponResult);
  const BackIcon = dir(locale) === "rtl" ? ArrowRight : ArrowLeft;

  return (
    <div className="mx-auto max-w-lg">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1.5 text-sm font-medium text-ink/65 hover:text-primary-700"
      >
        <BackIcon size={15} />
        {dict.courseDetails.backToCourse}
      </button>

      <div className="rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
        <p className="text-center text-sm font-medium text-ink/65">{dict.communityDetails.amountDue}</p>

        {checkingCoupon ? (
          <div className="mt-2 flex items-center justify-center gap-2 py-2 text-ink/65">
            <Loader2 size={20} className="animate-spin" />
          </div>
        ) : (
          <div className="mt-2 flex flex-wrap items-baseline justify-center gap-2">
            <p className="font-mono text-4xl font-bold text-ink">
              {course.isFree ? dict.common.free : formatPrice(finalWithCoupon, locale, settings?.currency)}
            </p>
            {showOldPrice && (
              <p className="font-mono text-base text-ink/65 line-through">
                {formatPrice(course.price, locale, settings?.currency)}
              </p>
            )}
          </div>
        )}

        {(hasCourseDiscount || couponResult) && !checkingCoupon && (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
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
        )}

        <div className="my-6 flex items-center gap-3 rounded-xl border border-line bg-paper px-4 py-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-50 text-sm font-bold text-primary-700">
            {course.title.slice(0, 1)}
          </span>
          <div className="min-w-0">
            <p className="text-xs text-ink/65">{dict.courseDetails.checkoutPurchasing}</p>
            <p className="truncate text-sm font-semibold text-ink">{course.title}</p>
          </div>
        </div>

        {confirming ? (
          <p className="flex items-center justify-center gap-2 rounded-xl bg-accent-50 px-3.5 py-3 text-sm text-accent-800">
            <Loader2 size={16} className="shrink-0 animate-spin" />
            {dict.communityDetails.subscribeConfirmBody}
          </p>
        ) : (
          <button
            onClick={handleConfirm}
            disabled={checkingCoupon}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-accent-500 py-3.5 text-sm font-semibold text-ink transition hover:bg-accent-400 disabled:opacity-60"
          >
            <CheckCircle2 size={16} />
            {dict.common.buyNow}
          </button>
        )}

        {error && (
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-danger/10 px-3.5 py-2.5 text-xs text-danger">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
