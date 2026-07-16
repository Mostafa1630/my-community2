"use client";

import { useState } from "react";
import { Plus, Trash2, Tag } from "lucide-react";
import type { Coupon } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import { usePlatformStore } from "@/lib/platform-store";
import { formatDate } from "@/lib/format";
import { Table, Thead, Th, Tr, Td } from "./Table";
import Badge from "./Badge";
import EmptyState from "./EmptyState";
import DashboardPageHeader from "./DashboardPageHeader";

export default function CreatorCouponsView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { user } = useAuth();
  const store = usePlatformStore();
  const [creating, setCreating] = useState(false);
  const [code, setCode] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(10);
  const [expiresAt, setExpiresAt] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (!user || user.role !== "creator") return null;

  const myCoupons = store.coupons.all
    .filter((c) => c.userId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  function openCreate() {
    setCode("");
    setDiscountPercentage(10);
    setExpiresAt("");
    setCreating(true);
  }

  function submit() {
    if (!code.trim() || !expiresAt) return;
    const coupon: Coupon = {
      id: `coupon-local-${Date.now()}`,
      userId: user!.id,
      code: code.trim().toUpperCase(),
      discountPercentage: Math.min(100, Math.max(0, discountPercentage)),
      expiresAt: new Date(expiresAt).toISOString(),
      createdAt: new Date().toISOString()
    };
    store.coupons.add(coupon);
    setCreating(false);
  }

  return (
    <div>
      <DashboardPageHeader
        title={dict.creatorDash.couponsTitle}
        subtitle={dict.creatorDash.couponsSubtitle}
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-full bg-accent-500 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-accent-400"
          >
            <Plus size={16} />
            {dict.creatorDash.newCoupon}
          </button>
        }
      />

      {myCoupons.length === 0 ? (
        <EmptyState icon={Tag} title={dict.common.empty} />
      ) : (
        <Table>
          <Thead>
            <Th>{dict.creatorDash.fieldCouponCode}</Th>
            <Th>{dict.creatorDash.fieldCouponDiscount}</Th>
            <Th>{dict.creatorDash.fieldCouponExpiry}</Th>
            <Th>{dict.common.status}</Th>
            <Th>{dict.common.actions}</Th>
          </Thead>
          <tbody>
            {myCoupons.map((coupon) => {
              const expired = new Date(coupon.expiresAt).getTime() <= Date.now();
              return (
                <Tr key={coupon.id}>
                  <Td className="font-mono font-medium text-ink">{coupon.code}</Td>
                  <Td className="font-mono">%{coupon.discountPercentage}</Td>
                  <Td>{formatDate(coupon.expiresAt, locale)}</Td>
                  <Td>
                    <Badge tone={expired ? "danger" : "success"}>
                      {expired ? dict.creatorDash.couponExpired : dict.common.active}
                    </Badge>
                  </Td>
                  <Td>
                    <button
                      onClick={() => setConfirmId(coupon.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/50 hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash2 size={15} />
                    </button>
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      )}

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm space-y-4 rounded-2xl bg-surface p-6 shadow-raised">
            <h3 className="text-base font-bold text-ink">{dict.creatorDash.newCoupon}</h3>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink/60">{dict.creatorDash.fieldCouponCode}</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                dir="ltr"
                className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm font-mono outline-none focus:border-primary-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink/60">{dict.creatorDash.fieldCouponDiscount}</label>
              <input
                type="number"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(Number(e.target.value) || 0)}
                className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink/60">{dict.creatorDash.fieldCouponExpiry}</label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setCreating(false)} className="rounded-full border border-line px-4 py-2.5 text-sm font-medium text-ink/70">
                {dict.common.cancel}
              </button>
              <button onClick={submit} className="rounded-full bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white">
                {dict.common.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-raised">
            <h3 className="text-base font-bold text-ink">{dict.common.delete}?</h3>
            <div className="mt-6 flex gap-2">
              <button onClick={() => setConfirmId(null)} className="flex-1 rounded-full border border-line py-2.5 text-sm font-medium text-ink/70">
                {dict.common.cancel}
              </button>
              <button
                onClick={() => {
                  store.coupons.remove(confirmId);
                  setConfirmId(null);
                }}
                className="flex-1 rounded-full bg-danger py-2.5 text-sm font-semibold text-white"
              >
                {dict.common.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
