"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, Sparkles, Tag } from "lucide-react";
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
  const [notConnectedNotice, setNotConnectedNotice] = useState(false);

  const showOldPrice = !community.isFree && community.discountPercentage > 0;
  const finalWithCoupon = couponResult
    ? community.subscriptionPrice * (1 - couponResult.discountPercentage / 100)
    : community.finalPrice;

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
        <p className="font-mono text-3xl font-bold text-ink">
          {community.isFree ? dict.common.free : formatPrice(finalWithCoupon, locale)}
        </p>
        {showOldPrice && (
          <>
            <p className="font-mono text-base text-ink/40 line-through">
              {formatPrice(community.subscriptionPrice, locale)}
            </p>
            <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[11px] font-bold text-danger">
              -{community.discountPercentage}%
            </span>
          </>
        )}
      </div>

      {!community.isFree && role === "student" && (
        <div className="mt-4 rounded-xl border border-accent-200 bg-accent-50/50 p-3.5">
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-accent-800">
            <Tag size={14} />
            {dict.communityDetails.couponLabel}
          </label>
          <p className="mb-2 text-xs text-ink/55">{dict.communityDetails.couponHint}</p>
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

      {notConnectedNotice ? (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-accent-50 px-3 py-2.5 text-xs text-accent-800">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          {dict.communityDetails.subscribeNotConnected}
        </p>
      ) : role === "student" ? (
        <button
          onClick={() => setNotConnectedNotice(true)}
          className="mt-4 flex w-full items-center justify-center rounded-full bg-accent-500 py-3 text-sm font-semibold text-ink transition hover:bg-accent-400"
        >
          {community.isFree ? dict.communityDetails.freeSubscribe : dict.communityDetails.subscribeNow}
        </button>
      ) : (
        <Link
          href={`/${locale}/login`}
          className="mt-4 flex w-full items-center justify-center rounded-full bg-accent-500 py-3 text-sm font-semibold text-ink transition hover:bg-accent-400"
        >
          {dict.communityDetails.subscribeNow}
        </Link>
      )}

      <ul className="mt-5 space-y-2.5 border-t border-line pt-5 text-sm text-ink/65">
        <li className="flex items-center gap-2"><Sparkles size={14} className="text-primary-500" />{dict.courseDetails.get1}</li>
        <li className="flex items-center gap-2"><Sparkles size={14} className="text-primary-500" />{dict.courseDetails.get2}</li>
        <li className="flex items-center gap-2"><Sparkles size={14} className="text-primary-500" />{dict.courseDetails.get3}</li>
        <li className="flex items-center gap-2"><Sparkles size={14} className="text-primary-500" />{dict.courseDetails.get4}</li>
      </ul>
    </div>
  );
}
