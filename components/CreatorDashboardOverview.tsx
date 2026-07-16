"use client";

import { BookOpen, Users, Users2, Wallet } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { t } from "@/lib/i18n/t";
import { useAuth } from "@/lib/auth-context";
import { usePlatformStore } from "@/lib/platform-store";
import { getUserById } from "@/lib/data";
import { formatNumber, formatPrice, formatDate } from "@/lib/format";
import StatCard from "@/components/StatCard";
import { Table, Thead, Th, Tr, Td } from "@/components/Table";
import DashboardPageHeader from "@/components/DashboardPageHeader";

export default function CreatorDashboardOverview({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { user } = useAuth();
  const store = usePlatformStore();
  if (!user || user.role !== "creator") return null;

  const myCourses = store.courses.all.filter((c) => c.creatorId === user.id);
  const publishedCount = myCourses.filter((c) => c.status === "published").length;
  const totalStudents = myCourses.reduce((sum, c) => sum + c.studentsCount, 0);
  const community = store.communities.all.find((c) => c.creatorId === user.id);
  const activeSubscriptions = community
    ? store.communitySubscriptions.all.filter(
        (s) => s.communityId === community.id && s.status === "active" && new Date(s.endsAt).getTime() > Date.now()
      )
    : [];
  const subscribersCount = activeSubscriptions.length;

  const myCourseIds = new Set(myCourses.map((c) => c.id));
  const courseSales = store.enrollments.all
    .filter((e) => myCourseIds.has(e.courseId))
    .map((e) => ({ id: e.id, studentId: e.studentId, pricePaid: e.pricePaid, date: e.enrolledAt }));
  const communitySales = store.communitySubscriptions.all
    .filter((s) => s.communityId === community?.id)
    .map((s) => ({ id: s.id, studentId: s.studentId, pricePaid: s.pricePaid, date: s.startsAt }));
  const sales = [...courseSales, ...communitySales].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div>
      <DashboardPageHeader title={t(dict.creatorDash.welcomeBack, { name: user.name.split(" ")[0] })} />

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={BookOpen} label={dict.creatorDash.statCourses} value={formatNumber(publishedCount, locale)} />
        <StatCard icon={Users2} label={dict.creatorDash.statSubscribers} value={formatNumber(subscribersCount, locale)} />
        <StatCard icon={Users} label={dict.creatorDash.statStudents} value={formatNumber(totalStudents, locale)} />
        <StatCard icon={Wallet} label={dict.creatorDash.statBalance} value={formatPrice(user.balance, locale)} tone="accent" />
      </div>

      <h2 className="mb-3 mt-10 text-lg font-bold text-ink">{dict.creatorDash.recentSales}</h2>
      <Table>
        <Thead>
          <Th>{dict.common.name}</Th>
          <Th>{dict.common.amount}</Th>
          <Th>{dict.common.date}</Th>
        </Thead>
        <tbody>
          {sales.slice(0, 8).map((s) => {
            const student = getUserById(s.studentId);
            return (
              <Tr key={s.id}>
                <Td>{student?.name}</Td>
                <Td className="font-mono">{formatPrice(s.pricePaid, locale)}</Td>
                <Td>{formatDate(s.date, locale)}</Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
