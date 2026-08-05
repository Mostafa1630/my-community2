"use client";

import { Wallet, TrendingUp, Percent, PiggyBank } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import { usePlatformStore } from "@/lib/platform-store";
import { getUserById } from "@/lib/data";
import { formatPrice, formatDate } from "@/lib/format";
import StatCard from "./StatCard";
import { Table, Thead, Th, Tr, Td } from "./Table";
import DashboardPageHeader from "./DashboardPageHeader";

export default function CreatorEarningsView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { user } = useAuth();
  const store = usePlatformStore();
  if (!user || user.role !== "creator") return null;

  const community = store.communities.all.find((c) => c.creatorId === user.id);
  const myCourseIds = new Set(store.courses.all.filter((c) => c.creatorId === user.id).map((c) => c.id));
  const courseSales = store.enrollments.all
    .filter((e) => myCourseIds.has(e.courseId))
    .map((e) => ({ id: e.id, studentId: e.studentId, pricePaid: e.pricePaid, platformCommission: e.platformCommission, creatorEarning: e.creatorEarning, date: e.enrolledAt }));
  const communitySales = store.communitySubscriptions.all
    .filter((s) => s.communityId === community?.id)
    .map((s) => ({ id: s.id, studentId: s.studentId, pricePaid: s.pricePaid, platformCommission: s.platformCommission, creatorEarning: s.creatorEarning, date: s.startsAt }));
  const sales = [...courseSales, ...communitySales].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalSales = sales.reduce((sum, s) => sum + s.pricePaid, 0);
  const commissionTotal = sales.reduce((sum, s) => sum + s.platformCommission, 0);

  return (
    <div>
      <DashboardPageHeader title={dict.creatorDash.earningsTitle} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Wallet} label={dict.creatorDash.earningsBalance} value={formatPrice(user.balance, locale)} tone="accent" />
        <StatCard icon={TrendingUp} label={dict.creatorDash.earningsTotalSales} value={formatPrice(totalSales, locale)} />
        <StatCard icon={Percent} label={dict.creatorDash.earningsCommission} value={formatPrice(commissionTotal, locale)} />
        <StatCard icon={PiggyBank} label={dict.creatorDash.earningsAvailable} value={formatPrice(user.balance, locale)} tone="accent" />
      </div>

      <h2 className="mb-3 mt-10 text-lg font-bold text-ink">{dict.creatorDash.recentSales}</h2>
      <Table>
        <Thead>
          <Th>{dict.common.name}</Th>
          <Th>{dict.common.amount}</Th>
          <Th>{dict.creatorDash.earningsCommission}</Th>
          <Th>{dict.common.date}</Th>
        </Thead>
        <tbody>
          {sales.map((s) => {
            const student = getUserById(s.studentId);
            return (
              <Tr key={s.id}>
                <Td>{student?.name}</Td>
                <Td className="font-mono">{formatPrice(s.creatorEarning, locale)}</Td>
                <Td className="font-mono text-ink/65">-{formatPrice(s.platformCommission, locale)}</Td>
                <Td>{formatDate(s.date, locale)}</Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
