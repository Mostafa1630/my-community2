"use client";

import { useEffect, useState } from "react";
import { Wallet, TrendingUp, Percent, PiggyBank } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { CreatorEarningsSummary, CreatorSale } from "@/lib/api-types";
import { useAuth } from "@/lib/auth-context";
import { formatPrice } from "@/lib/format";
import StatCard from "./StatCard";
import { Table, Thead, Th, Tr, Td } from "./Table";
import Badge from "./Badge";
import EmptyState from "./EmptyState";
import PageLoader from "./PageLoader";
import Pagination from "./Pagination";
import DashboardPageHeader from "./DashboardPageHeader";

// GET /creators/earnings (summary) + GET /creators/earnings/sales (paginated
// list) — replaces the old local-mock computation. Stat card order follows
// the client's own explicit spec: total sales, then platform commission,
// then net profit, then current balance.
export default function CreatorEarningsView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { user, getEarningsSummary, getEarningsSales } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<CreatorEarningsSummary | null>(null);
  const [sales, setSales] = useState<CreatorSale[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    if (!user || user.role !== "creator") {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([getEarningsSummary(locale), getEarningsSales(locale, page)])
      .then(([summaryRes, salesRes]) => {
        if (cancelled) return;
        setSummary(summaryRes);
        setSales(salesRes.items);
        setLastPage(salesRes.lastPage);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, locale, page]);

  if (!user || user.role !== "creator") return null;

  return (
    <div>
      <DashboardPageHeader title={dict.creatorDash.earningsTitle} />

      {loading || !summary ? (
        <PageLoader />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={TrendingUp} label={dict.creatorDash.earningsTotalSales} value={formatPrice(summary.totalSales, locale)} />
            <StatCard icon={Percent} label={dict.creatorDash.earningsCommission} value={formatPrice(summary.platformCommission, locale)} />
            <StatCard icon={PiggyBank} label={dict.creatorDash.earningsNetProfit} value={formatPrice(summary.netProfit, locale)} />
            <StatCard icon={Wallet} label={dict.creatorDash.earningsBalance} value={formatPrice(summary.currentBalance, locale)} tone="accent" />
          </div>

          <h2 className="mb-3 mt-10 text-lg font-bold text-ink">{dict.creatorDash.earningsSalesTitle}</h2>
          {sales.length === 0 ? (
            <EmptyState icon={Wallet} title={dict.creatorDash.earningsSalesEmpty} />
          ) : (
            <>
              <Table>
                <Thead>
                  <Th>{dict.common.name}</Th>
                  <Th>{dict.common.type}</Th>
                  <Th>{dict.common.amount}</Th>
                  <Th>{dict.creatorDash.earningsCommission}</Th>
                  <Th>{dict.creatorDash.earningsNetProfit}</Th>
                  <Th>{dict.common.date}</Th>
                </Thead>
                <tbody>
                  {sales.map((s, i) => (
                    <Tr key={i}>
                      <Td className="flex items-center gap-2.5">
                        <img
                          src={s.user.profileImage || "/images/avatar-placeholder.jpg"}
                          alt=""
                          className="h-7 w-7 shrink-0 rounded-full object-cover"
                        />
                        {s.user.name}
                      </Td>
                      <Td>
                        <Badge tone={s.type === "course" ? "success" : "pending"}>
                          {s.type === "course" ? dict.creatorDash.saleTypeCourse : dict.creatorDash.saleTypeCommunity}
                        </Badge>
                      </Td>
                      <Td className="font-mono">{formatPrice(s.amount, locale)}</Td>
                      <Td className="font-mono text-ink/65">-{formatPrice(s.platformCommission, locale)}</Td>
                      <Td className="font-mono">{formatPrice(s.netProfit, locale)}</Td>
                      <Td>{s.createdAt}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
              <Pagination page={page} totalPages={lastPage} onChange={setPage} dict={dict} />
            </>
          )}
        </>
      )}
    </div>
  );
}
