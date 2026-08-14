"use client";

import { useEffect, useState } from "react";
import { BookOpen, Users, Users2, Wallet } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { CreatorDashboardSummary } from "@/lib/api-types";
import { t } from "@/lib/i18n/t";
import { useAuth } from "@/lib/auth-context";
import { formatNumber, formatPrice } from "@/lib/format";
import StatCard from "@/components/StatCard";
import DashboardPageHeader from "@/components/DashboardPageHeader";
import PageLoader from "@/components/PageLoader";

export default function CreatorDashboardOverview({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { user, getCreatorDashboard, settings } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<CreatorDashboardSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!user || user.role !== "creator") {
      setLoading(false);
      return;
    }
    setLoading(true);
    getCreatorDashboard(locale)
      .then((res) => {
        if (!cancelled) setSummary(res);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };

  }, [user?.id, locale]);

  if (!user || user.role !== "creator") return null;

  return (
    <div>
      <DashboardPageHeader title={t(dict.creatorDash.welcomeBack, { name: user.name.split(" ")[0] })} />

      {loading || !summary ? (
        <PageLoader />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={BookOpen} label={dict.creatorDash.statCourses} value={formatNumber(summary.publishedCourses, locale)} />
            <StatCard icon={Users2} label={dict.creatorDash.statSubscribers} value={formatNumber(summary.communitySubscribers, locale)} />
            <StatCard icon={Users} label={dict.creatorDash.statStudents} value={formatNumber(summary.totalStudents, locale)} />
            <StatCard icon={Wallet} label={dict.creatorDash.statBalance} value={formatPrice(summary.currentBalance, locale, settings?.currency)} tone="accent" />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label={dict.creatorDash.statFreeCourses} value={formatNumber(summary.freeCourses, locale)} compact />
            <StatCard label={dict.creatorDash.statPaidCourses} value={formatNumber(summary.paidCourses, locale)} compact />
            <StatCard label={dict.creatorDash.statFreeSubscribers} value={formatNumber(summary.freeSubscribers, locale)} compact />
            <StatCard label={dict.creatorDash.statPaidSubscribers} value={formatNumber(summary.paidSubscribers, locale)} compact />
            <StatCard label={dict.creatorDash.statCourseStudents} value={formatNumber(summary.courseStudents, locale)} compact />
            <StatCard label={dict.creatorDash.statTotalWithdrawn} value={formatPrice(summary.totalWithdrawn, locale, settings?.currency)} compact />
            <StatCard label={dict.creatorDash.statPendingBalance} value={formatPrice(summary.pendingBalance, locale, settings?.currency)} compact />
          </div>
        </>
      )}
    </div>
  );
}
