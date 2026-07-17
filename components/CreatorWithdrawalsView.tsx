"use client";

import { useState } from "react";
import { Plus, Landmark } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { PayoutMethod } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { usePlatformStore } from "@/lib/platform-store";
import { formatPrice, formatDate } from "@/lib/format";
import { Table, Thead, Th, Tr, Td } from "./Table";
import Badge from "./Badge";
import EmptyState from "./EmptyState";
import DashboardPageHeader from "./DashboardPageHeader";
import Modal from "./motion/Modal";

export default function CreatorWithdrawalsView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { user } = useAuth();
  const store = usePlatformStore();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>("vodafone_cash");
  const [payoutAccountNumber, setPayoutAccountNumber] = useState("");

  if (!user || user.role !== "creator") return null;

  const rows = store.withdrawalRequests.all
    .filter((w) => w.creatorId === user.id)
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

  function submit() {
    const value = Number(amount);
    if (!value || value <= 0 || !payoutAccountNumber.trim()) return;
    store.withdrawalRequests.add({
      id: `wd-local-${Date.now()}`,
      creatorId: user!.id,
      amount: value,
      payoutMethod,
      payoutAccountNumber: payoutAccountNumber.trim(),
      status: "pending",
      requestedAt: new Date().toISOString()
    });
    setAmount("");
    setPayoutAccountNumber("");
    setOpen(false);
  }

  return (
    <div>
      <DashboardPageHeader
        title={dict.creatorDash.withdrawalsTitle}
        subtitle={dict.creatorDash.withdrawalsSubtitle}
        action={
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-accent-500 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-accent-400"
          >
            <Plus size={16} />
            {dict.creatorDash.newWithdrawal}
          </button>
        }
      />

      {rows.length === 0 ? (
        <EmptyState icon={Landmark} title={dict.common.empty} />
      ) : (
        <Table>
          <Thead>
            <Th>{dict.common.amount}</Th>
            <Th>{dict.creatorDash.fieldPayoutMethod}</Th>
            <Th>{dict.common.date}</Th>
            <Th>{dict.common.status}</Th>
          </Thead>
          <tbody>
            {rows.map((w) => (
              <Tr key={w.id}>
                <Td className="font-mono">{formatPrice(w.amount, locale)}</Td>
                <Td>
                  {w.payoutMethod === "vodafone_cash" ? dict.creatorDash.payoutVodafoneCash : dict.creatorDash.payoutInstapay}
                </Td>
                <Td>{formatDate(w.requestedAt, locale)}</Td>
                <Td>
                  <Badge tone={w.status === "approved" ? "success" : w.status === "rejected" ? "danger" : "pending"}>
                    {w.status === "approved" ? dict.common.approved : w.status === "rejected" ? dict.common.rejected : dict.common.pending}
                  </Badge>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={open} onClose={() => setOpen(false)}>
        <h3 className="text-base font-bold text-ink">{dict.creatorDash.newWithdrawal}</h3>
        <p className="mt-2 text-xs text-ink/50">
          {dict.creatorDash.earningsAvailable}: {formatPrice(user.balance, locale)}
        </p>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          className="mt-4 w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
        />
        <label className="mb-1.5 mt-4 block text-xs font-medium text-ink/60">{dict.creatorDash.fieldPayoutMethod}</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPayoutMethod("vodafone_cash")}
            className={`flex-1 rounded-full border px-3 py-2 text-xs font-medium ${
              payoutMethod === "vodafone_cash" ? "border-primary-500 bg-primary-50 text-primary-700" : "border-line text-ink/60"
            }`}
          >
            {dict.creatorDash.payoutVodafoneCash}
          </button>
          <button
            type="button"
            onClick={() => setPayoutMethod("instapay")}
            className={`flex-1 rounded-full border px-3 py-2 text-xs font-medium ${
              payoutMethod === "instapay" ? "border-primary-500 bg-primary-50 text-primary-700" : "border-line text-ink/60"
            }`}
          >
            {dict.creatorDash.payoutInstapay}
          </button>
        </div>
        <label className="mb-1.5 mt-4 block text-xs font-medium text-ink/60">{dict.creatorDash.fieldPayoutAccount}</label>
        <input
          value={payoutAccountNumber}
          onChange={(e) => setPayoutAccountNumber(e.target.value)}
          className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
        />
        <div className="mt-6 flex gap-2">
          <button onClick={() => setOpen(false)} className="flex-1 rounded-full border border-line py-2.5 text-sm font-medium text-ink/70">
            {dict.common.cancel}
          </button>
          <button onClick={submit} className="flex-1 rounded-full bg-primary-500 py-2.5 text-sm font-semibold text-white">
            {dict.common.requestWithdrawal}
          </button>
        </div>
      </Modal>
    </div>
  );
}
