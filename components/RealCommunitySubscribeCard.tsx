"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, Tag } from "lucide-react";
import type { CommunityDetails } from "@/lib/api-types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { t } from "@/lib/i18n/t";
import { useAuth } from "@/lib/auth-context";
import { useCommunitySubscription } from "@/lib/use-details-access";
import { ApiError } from "@/lib/api-client";
import { formatPrice, formatDate } from "@/lib/format";

function subscriptionDurationLabel(days: number, dict: Dictionary) {
  if (days === 30) {
    return t(dict.communityDetails.subscriptionDuration, { duration: dict.communityDetails.durationMonth });
  }
  if (days === 365) {
    return t(dict.communityDetails.subscriptionDuration, { duration: dict.communityDetails.durationYear });
  }
  return t(dict.communityDetails.subscriptionDuration, {
    duration: t(dict.communityDetails.durationDays, { days: String(days) })
  });
}

export default function RealCommunitySubscribeCard({
  community,
  locale,
  dict
}: {
  community: CommunityDetails;
  locale: Locale;
  dict: Dictionary;
}) {
  const { role, user, hydrated, sessionReady, checkCoupon, settings, getCommunitySubscriptionDates, isSubscribed } =
    useAuth();
  const { subscribed: detailsSubscribed, resolved: subscriptionResolved } = useCommunitySubscription(
    community.id,
    locale,
    community.isSubscribed,
  );
  const cachedSubscribed = role === "student" && isSubscribed(community.id);
  const subscribed =
    role === "student" && (detailsSubscribed || (!subscriptionResolved && cachedSubscribed));
  const subscriptionDates = subscribed ? getCommunitySubscriptionDates(community.id) : null;
  const membershipPending = role === "student" && !subscriptionResolved && !cachedSubscribed;
  const accessLoading = !hydrated || !sessionReady || (membershipPending && !community.isSubscribed);
  const showPricing = role !== "student" || (!subscribed && !accessLoading);
  const [couponCode, setCouponCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [couponResult, setCouponResult] = useState<{ discountPercentage: number } | null>(null);
  const [couponError, setCouponError] = useState("");

  const hasCommunityDiscount = !community.isFree && community.discountPercentage > 0;
  const finalWithCoupon = couponResult
    ? community.finalPrice * (1 - couponResult.discountPercentage / 100)
    : community.finalPrice;
  const showOldPrice = !community.isFree && (hasCommunityDiscount || !!couponResult);

  async function handleCheckCoupon() {
    if (!couponCode.trim()) return;
    setChecking(true);
    setCouponError("");
    setCouponResult(null);
    try {
      const result = await checkCoupon({ creatorId: community.creator.id, code: couponCode.trim() }, locale);
      setCouponResult({ discountPercentage: result.discountPercentage });
    } catch (err) {
      setCouponError(err instanceof ApiError ? err.message : dict.communityDetails.couponInvalid);
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      {showPricing && (
        <div className="border-b border-line bg-paper/60 px-5 py-5 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/50">
            {dict.communityDetails.checkoutTitle}
          </p>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <p className="font-mono text-3xl font-black tracking-tight text-ink">
              {community.isFree ? dict.common.free : formatPrice(finalWithCoupon, locale, settings?.currency)}
            </p>
            {showOldPrice && (
              <p className="font-mono text-sm text-ink/55 line-through">
                {formatPrice(community.subscriptionPrice, locale, settings?.currency)}
              </p>
            )}
            {hasCommunityDiscount && (
              <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[11px] font-bold text-danger">
                -{community.discountPercentage}%
              </span>
            )}
            {couponResult && (
              <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-bold text-success">
                -{couponResult.discountPercentage}%
              </span>
            )}
          </div>
          {!community.isFree && (
            <p className="mt-2 text-xs text-ink/60">
              {subscriptionDurationLabel(community.subscriptionDurationDays, dict)}
            </p>
          )}
        </div>
      )}

      <div className="space-y-4 p-5 sm:p-6">
        {showPricing && !community.isFree && role === "student" && !subscribed && (
          <div className="rounded-xl border border-accent-200 bg-accent-50/50 p-3.5">
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-accent-800">
              <Tag size={14} />
              {dict.communityDetails.couponLabel}
            </label>
            <p className="mb-2 text-xs text-ink/65">{dict.communityDetails.couponHint}</p>
            <div className="flex gap-2">
              <input
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  setCouponResult(null);
                  setCouponError("");
                }}
                dir="ltr"
                placeholder={dict.communityDetails.couponPlaceholder}
                className="w-full rounded-xl border border-accent-200 bg-surface px-3.5 py-2 text-sm font-mono outline-none focus:border-accent-400"
              />
              <button
                type="button"
                onClick={handleCheckCoupon}
                disabled={checking || !couponCode.trim()}
                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-accent-500 px-4 text-sm font-semibold text-ink transition hover:bg-accent-400 disabled:opacity-60"
              >
                {checking && <Loader2 size={14} className="animate-spin" />}
                {dict.communityDetails.couponApplyButton}
              </button>
            </div>
            {couponResult && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-success">
                <CheckCircle2 size={13} />
                {dict.communityDetails.couponApplied}
              </p>
            )}
            {couponError && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-danger">
                <AlertCircle size={13} />
                {couponError}
              </p>
            )}
          </div>
        )}

        {accessLoading ? (
          <div className="space-y-2.5">
            {!showPricing && (
              <div className="flex items-start gap-3 rounded-2xl border border-line bg-paper/50 p-4">
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-line/60" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3.5 w-3/4 animate-pulse rounded bg-line/60" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-line/50" />
                </div>
              </div>
            )}
            <div className="h-[46px] w-full animate-pulse rounded-full bg-line/60" />
          </div>
        ) : role === "student" && subscribed ? (
          <>
            <div className="flex items-start gap-3 rounded-2xl border border-success/20 bg-success/5 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                <CheckCircle2 size={20} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-ink">{dict.communityDetails.alreadySubscribed}</p>
                {subscriptionDates && (
                  <p className="mt-1 text-xs leading-5 text-ink/60">
                    {t(dict.communityDetails.subscriptionPeriod, {
                      from: formatDate(subscriptionDates.startAt, locale),
                      to: formatDate(subscriptionDates.endAt, locale)
                    })}
                  </p>
                )}
              </div>
            </div>
            <Link
              href={`/${locale}/communities/${community.id}/feed`}
              className="flex w-full items-center justify-center rounded-full bg-primary-500 py-3 text-sm font-semibold text-white transition hover:bg-primary-600"
            >
              {dict.communityDetails.enterCommunity}
            </Link>
          </>
        ) : role === "student" ? (
          <Link
            href={`/${locale}/communities/${community.id}/checkout${couponResult ? `?coupon=${encodeURIComponent(couponCode.trim())}` : ""}`}
            className="flex w-full items-center justify-center rounded-full bg-accent-500 py-3 text-sm font-semibold text-ink transition hover:bg-accent-400"
          >
            {community.isFree ? dict.communityDetails.freeSubscribe : dict.communityDetails.subscribeNow}
          </Link>
        ) : user ? (
          <p className="flex items-center gap-1.5 rounded-2xl bg-paper px-4 py-3 text-sm font-medium text-ink/65">
            <AlertCircle size={15} className="shrink-0 text-accent-600" />
            {dict.communityDetails.mustBeStudentToSubscribe}
          </p>
        ) : (
          <Link
            href={`/${locale}/login`}
            className="flex w-full items-center justify-center rounded-full bg-accent-500 py-3 text-sm font-semibold text-ink transition hover:bg-accent-400"
          >
            {dict.communityDetails.subscribeNow}
          </Link>
        )}

        {community.type === "public" && !subscribed && !accessLoading && (
          <Link
            href={`/${locale}/communities/${community.id}/feed`}
            className="flex w-full items-center justify-center rounded-full border border-line py-3 text-sm font-semibold text-ink/70 transition hover:border-primary-300 hover:text-primary-700"
          >
            {dict.communityDetails.exploreCommunity}
          </Link>
        )}

        <div className="border-t border-line pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink/50">
            {dict.courseDetails.whatYouGet}
          </p>
          <ul className="space-y-2.5 text-sm text-ink/70">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-success" />
              {dict.courseDetails.get2}
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-success" />
              {dict.courseDetails.get3}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
