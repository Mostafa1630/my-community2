"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarClock, CheckCircle2, Lock, ShieldCheck, Sparkles, Tag } from "lucide-react";
import type { Community } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { t } from "@/lib/i18n/t";
import { useAuth } from "@/lib/auth-context";
import { usePlatformStore } from "@/lib/platform-store";
import { resolveCommunityPrice } from "@/lib/data";
import { formatPrice, formatNumber } from "@/lib/format";

function subscriptionDurationLabel(days: number, locale: Locale, dict: Dictionary) {
  if (days === 30) return dict.communityDetails.durationMonth;
  if (days === 365) return dict.communityDetails.durationYear;
  return t(dict.communityDetails.durationDays, { days: formatNumber(days, locale) });
}

export default function CommunitySubscribeCard({
  community,
  locale,
  dict
}: {
  community: Community;
  locale: Locale;
  dict: Dictionary;
}) {
  const { role, isSubscribed, subscribeToCommunity } = useAuth();
  const store = usePlatformStore();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [justSubscribed, setJustSubscribed] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  const subscribed = role === "student" && isSubscribed(community.id);
  const quote = resolveCommunityPrice(community, couponCode, store.coupons.all);
  const showOldPrice = !community.isFree && quote.amount < community.subscriptionPrice;
  const percentOff = showOldPrice
    ? Math.round((1 - quote.amount / community.subscriptionPrice) * 100)
    : 0;

  function confirmSubscribe() {
    subscribeToCommunity(community.id, couponCode);
    setConfirmOpen(false);
    setJustSubscribed(true);
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
      <div className="flex flex-wrap items-baseline gap-2">
        <p className="font-mono text-3xl font-bold text-ink">
          {community.isFree ? dict.common.free : formatPrice(quote.amount, locale)}
        </p>
        {showOldPrice && (
          <>
            <p className="font-mono text-base text-ink/40 line-through">{formatPrice(community.subscriptionPrice, locale)}</p>
            <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[11px] font-bold text-danger">
              -{percentOff}%
            </span>
          </>
        )}
      </div>

      {!community.isFree && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-ink/55">
          <CalendarClock size={13} className="shrink-0" />
          {t(dict.communityDetails.subscriptionDuration, {
            duration: subscriptionDurationLabel(community.subscriptionDurationDays, locale, dict)
          })}
        </p>
      )}

      {!community.isFree && (
        <div className="mt-4 rounded-xl border border-accent-200 bg-accent-50/50 p-3.5">
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-accent-800">
            <Tag size={14} />
            {dict.communityDetails.couponLabel}
          </label>
          <p className="mb-2 text-xs text-ink/55">{dict.communityDetails.couponHint}</p>
          <input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            dir="ltr"
            placeholder={dict.communityDetails.couponPlaceholder}
            className="w-full rounded-xl border border-accent-200 bg-surface px-3.5 py-2 text-sm font-mono outline-none focus:border-accent-400"
          />
          {couponCode.trim() && (
            <p className={`mt-1.5 text-xs font-medium ${quote.couponApplied ? "text-success" : "text-danger"}`}>
              {quote.couponApplied ? dict.communityDetails.couponApplied : dict.communityDetails.couponInvalid}
            </p>
          )}
        </div>
      )}

      {subscribed || justSubscribed ? (
        <>
          <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-success">
            <CheckCircle2 size={16} />
            {justSubscribed ? dict.communityDetails.subscribeSuccess : dict.communityDetails.alreadySubscribed}
          </p>
          <Link
            href={`/${locale}/communities/${community.slug}/feed`}
            className="mt-4 flex w-full items-center justify-center rounded-full bg-primary-500 py-3 text-sm font-semibold text-white transition hover:bg-primary-600"
          >
            {dict.communityDetails.enterCommunity}
          </Link>
        </>
      ) : role === "student" ? (
        <button
          onClick={() => setConfirmOpen(true)}
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

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-raised">
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-700">
              <Lock size={18} />
            </span>
            <h3 className="text-lg font-bold text-ink">{dict.communityDetails.subscribeConfirmTitle}</h3>
            <p className="mt-2 text-sm leading-6 text-ink/60">{dict.communityDetails.subscribeConfirmBody}</p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-ink/45">
              <ShieldCheck size={13} />
              {community.isFree ? dict.common.free : formatPrice(quote.amount, locale)}
            </div>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 rounded-full border border-line py-2.5 text-sm font-medium text-ink/70"
              >
                {dict.common.cancel}
              </button>
              <button
                onClick={confirmSubscribe}
                className="flex-1 rounded-full bg-primary-500 py-2.5 text-sm font-semibold text-white"
              >
                {dict.communityDetails.confirmSubscribe}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
