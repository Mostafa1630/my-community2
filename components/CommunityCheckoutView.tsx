"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import type { CommunityDetails } from "@/lib/api-types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { dir } from "@/lib/i18n/config";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { formatPrice } from "@/lib/format";

export default function CommunityCheckoutView({
  community,
  locale,
  dict,
  initialCouponCode
}: {
  community: CommunityDetails;
  locale: Locale;
  dict: Dictionary;
  initialCouponCode?: string;
}) {
  const router = useRouter();
  const { checkCoupon, settings } = useAuth();
  const [couponResult, setCouponResult] = useState<{ discountPercentage: number } | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(!!initialCouponCode);
  const [confirming, setConfirming] = useState(false);

  function handleConfirm() {
    // Nothing to actually pay for, so there's no reason to show the "online
    // payment isn't available yet" holding message here either — same
    // reasoning as skipping this whole page for free communities from the
    // details page's own subscribe button.
    if (community.isFree) {
      router.push(`/${locale}/communities/${community.id}/feed`);
      return;
    }
    setConfirming(true);
  }

  useEffect(() => {
    if (!initialCouponCode) return;
    checkCoupon({ creatorId: community.creator.id, code: initialCouponCode }, locale)
      .then((result) => setCouponResult({ discountPercentage: result.discountPercentage }))
      .catch(() => setCouponResult(null))
      .finally(() => setCheckingCoupon(false));
  }, [initialCouponCode, community.creator.id, locale, checkCoupon]);

  const hasCommunityDiscount = !community.isFree && community.discountPercentage > 0;
  const finalWithCoupon = couponResult
    ? community.finalPrice * (1 - couponResult.discountPercentage / 100)
    : community.finalPrice;
  const showOldPrice = !community.isFree && (hasCommunityDiscount || !!couponResult);
  const BackIcon = dir(locale) === "rtl" ? ArrowRight : ArrowLeft;

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href={`/${locale}/communities/${community.id}`}
        className="mb-6 flex items-center gap-1.5 text-sm font-medium text-ink/65 hover:text-primary-700"
      >
        <BackIcon size={15} />
        {dict.communityDetails.backToCommunity}
      </Link>

      <div className="rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
        <p className="text-center text-sm font-medium text-ink/65">{dict.communityDetails.amountDue}</p>

        {checkingCoupon ? (
          <div className="mt-2 flex items-center justify-center gap-2 py-2 text-ink/65">
            <Loader2 size={20} className="animate-spin" />
          </div>
        ) : (
          <div className="mt-2 flex flex-wrap items-baseline justify-center gap-2">
            <p className="font-mono text-4xl font-bold text-ink">
              {community.isFree ? dict.common.free : formatPrice(finalWithCoupon, locale, settings?.currency)}
            </p>
            {showOldPrice && (
              <p className="font-mono text-base text-ink/65 line-through">
                {formatPrice(community.subscriptionPrice, locale, settings?.currency)}
              </p>
            )}
          </div>
        )}

        {(hasCommunityDiscount || couponResult) && !checkingCoupon && (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
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
        )}

        <div className="my-6 flex items-center gap-3 rounded-xl border border-line bg-paper px-4 py-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-50 text-sm font-bold text-primary-700">
            {community.name.slice(0, 1)}
          </span>
          <div className="min-w-0">
            <p className="text-xs text-ink/65">{dict.communityDetails.checkoutSubscribingTo}</p>
            <p className="truncate text-sm font-semibold text-ink">{community.name}</p>
          </div>
        </div>

        {confirming ? (
          <p className="flex items-start gap-2 rounded-xl bg-accent-50 px-3.5 py-3 text-sm text-accent-800">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {dict.communityDetails.subscribeConfirmBody}
          </p>
        ) : (
          <button
            onClick={handleConfirm}
            disabled={checkingCoupon}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-accent-500 py-3.5 text-sm font-semibold text-ink transition hover:bg-accent-400 disabled:opacity-60"
          >
            <CheckCircle2 size={16} />
            {dict.communityDetails.confirmSubscribe}
          </button>
        )}
      </div>
    </div>
  );
}
