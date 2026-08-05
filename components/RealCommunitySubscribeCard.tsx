"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, Tag } from "lucide-react";
import type { CommunityDetails } from "@/lib/api-types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { formatPrice } from "@/lib/format";

export default function RealCommunitySubscribeCard({
  community,
  locale,
  dict
}: {
  community: CommunityDetails;
  locale: Locale;
  dict: Dictionary;
}) {
  const { role, checkCoupon } = useAuth();
  const [couponCode, setCouponCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [couponResult, setCouponResult] = useState<{ discountPercentage: number } | null>(null);
  const [couponError, setCouponError] = useState("");

  const hasCommunityDiscount = !community.isFree && community.discountPercentage > 0;
  // The community's own discount is already baked into `finalPrice` by the
  // API; a coupon stacks on top of that already-discounted price, not the
  // raw subscription price, so both discounts show up in the same final
  // number rather than the coupon silently overriding the community's own.
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
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
      <div className="flex flex-wrap items-baseline gap-2">
        <p className="font-mono text-2xl font-bold text-ink">
          {community.isFree ? dict.common.free : formatPrice(finalWithCoupon, locale)}
        </p>
        {showOldPrice && (
          <p className="font-mono text-sm text-ink/65 line-through">
            {formatPrice(community.subscriptionPrice, locale)}
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

      {!community.isFree && role === "student" && (
        <div className="mt-4 rounded-xl border border-accent-200 bg-accent-50/50 p-3.5">
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

      {role === "student" ? (
        <Link
          href={`/${locale}/communities/${community.id}/checkout${couponResult ? `?coupon=${encodeURIComponent(couponCode.trim())}` : ""}`}
          className="mt-4 flex w-full items-center justify-center rounded-full bg-accent-500 py-3 text-sm font-semibold text-ink transition hover:bg-accent-400"
        >
          {community.isFree ? dict.communityDetails.freeSubscribe : dict.communityDetails.subscribeNow}
        </Link>
      ) : (
        <Link
          href={`/${locale}/login`}
          className="mt-4 flex w-full items-center justify-center rounded-full bg-accent-500 py-3 text-sm font-semibold text-ink transition hover:bg-accent-400"
        >
          {dict.communityDetails.subscribeNow}
        </Link>
      )}

      <ul className="mt-5 space-y-2.5 border-t border-line pt-5 text-sm text-ink/65">
        <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-success" />{dict.courseDetails.get1}</li>
        <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-success" />{dict.courseDetails.get2}</li>
        <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-success" />{dict.courseDetails.get3}</li>
        <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-success" />{dict.courseDetails.get4}</li>
      </ul>
    </div>
  );
}
