"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Landmark, Loader2, Plus, Trash2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { CreatorWithdrawal, CreatorWithdrawalDetails, PayoutMethod } from "@/lib/api-types";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { formatPrice } from "@/lib/format";
import { Table, Thead, Th, Tr, Td } from "./Table";
import Badge from "./Badge";
import EmptyState from "./EmptyState";
import PageLoader from "./PageLoader";
import Pagination from "./Pagination";
import DashboardPageHeader from "./DashboardPageHeader";
import Modal from "./motion/Modal";

// "wallet" replaces the old "vodafone_cash" value (renamed at the client's
// request — same payout method, new label: "Wallet" / "المحفظة"), plus the
// new "bank_account" option. A withdrawal fetched from the real backend can
// still carry the legacy "vodafone_cash" value on old rows, so that's kept
// as an alias mapping to the same label rather than dropped.
const methodLabel = (dict: Dictionary, method: string) => {
  if (method === "wallet" || method === "vodafone_cash") return dict.creatorDash.payoutWallet;
  if (method === "bank_account") return dict.creatorDash.payoutBankAccount;
  return dict.creatorDash.payoutInstapay;
};

const statusTone = (status: string) => (status === "approved" ? "success" : status === "rejected" ? "danger" : "pending");

const statusLabel = (dict: Dictionary, status: string) =>
  status === "approved" ? dict.common.approved : status === "rejected" ? dict.common.rejected : dict.common.pending;

export default function CreatorWithdrawalsView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { user, getWithdrawBalance, getWithdrawals, createWithdrawal, getWithdrawalDetails, deleteWithdrawal } = useAuth();

  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [rows, setRows] = useState<CreatorWithdrawal[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>("wallet");
  const [payoutAccountNumber, setPayoutAccountNumber] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [detailsFor, setDetailsFor] = useState<string | null>(null);
  const [details, setDetails] = useState<CreatorWithdrawalDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    if (!user || user.role !== "creator") {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [balanceRes, listRes] = await Promise.all([getWithdrawBalance(locale), getWithdrawals(locale, page)]);
    setBalance(balanceRes);
    setRows(listRes.items);
    setLastPage(listRes.lastPage);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, locale, page]);

  if (!user || user.role !== "creator") return null;

  async function submitCreate() {
    const value = Number(amount);
    if (!value || value <= 0 || !payoutAccountNumber.trim()) return;
    setCreating(true);
    setCreateError("");
    try {
      await createWithdrawal({ amount: value, payoutMethod, payoutAccountNumber: payoutAccountNumber.trim() }, locale);
      setAmount("");
      setPayoutAccountNumber("");
      setPayoutMethod("wallet");
      setCreateOpen(false);
      setPage(1);
      await load();
    } catch (err) {
      if (err instanceof ApiError) {
        const fieldMessage = Object.values(err.fieldErrors).flat()[0];
        setCreateError(fieldMessage || err.message);
      } else {
        setCreateError(dict.creatorDash.withdrawCreateError);
      }
    } finally {
      setCreating(false);
    }
  }

  async function openDetails(id: string) {
    setDetailsFor(id);
    setDetailsLoading(true);
    setDetails(await getWithdrawalDetails(id, locale));
    setDetailsLoading(false);
  }

  async function confirmDelete() {
    if (!confirmDeleteId) return;
    setDeleting(true);
    try {
      await deleteWithdrawal(confirmDeleteId, locale);
      setConfirmDeleteId(null);
      await load();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <DashboardPageHeader
        title={dict.creatorDash.withdrawalsTitle}
        subtitle={dict.creatorDash.withdrawalsSubtitle}
        action={
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-accent-500 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-accent-400"
          >
            <Plus size={16} />
            {dict.creatorDash.newWithdrawal}
          </button>
        }
      />

      {loading ? (
        <PageLoader />
      ) : (
        <>
          <div className="mb-6 rounded-2xl border border-line bg-surface p-5 shadow-card">
            <p className="text-xs font-medium tracking-wide text-ink/55">{dict.creatorDash.withdrawAvailableBalance}</p>
            <p className="mt-1.5 font-mono text-2xl font-bold text-ink">{formatPrice(balance, locale)}</p>
          </div>

          {rows.length === 0 ? (
            <EmptyState icon={Landmark} title={dict.common.empty} />
          ) : (
            <>
              <Table>
                <Thead>
                  <Th>{dict.common.amount}</Th>
                  <Th>{dict.creatorDash.fieldPayoutMethod}</Th>
                  <Th>{dict.common.date}</Th>
                  <Th>{dict.common.status}</Th>
                  <Th />
                </Thead>
                <tbody>
                  {rows.map((w) => (
                    <Tr key={w.id}>
                      <Td className="font-mono">{formatPrice(w.amount, locale)}</Td>
                      <Td>{methodLabel(dict, w.payoutMethod)}</Td>
                      <Td>{w.createdAt}</Td>
                      <Td>
                        <Badge tone={statusTone(w.status)}>{statusLabel(dict, w.status)}</Badge>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => openDetails(w.id)}
                            className="text-xs font-semibold text-primary-700 hover:underline"
                          >
                            {dict.common.viewDetails}
                          </button>
                          {w.status === "pending" && (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(w.id)}
                              className="text-danger hover:opacity-80"
                              aria-label="delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
              <Pagination page={page} totalPages={lastPage} onChange={setPage} dict={dict} />
            </>
          )}
        </>
      )}

      {/* Create request */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)}>
        <h3 className="text-base font-bold text-ink">{dict.creatorDash.newWithdrawal}</h3>
        <p className="mt-2 text-xs text-ink/65">
          {dict.creatorDash.withdrawAvailableBalance}: {formatPrice(balance, locale)}
        </p>
        <label className="mb-1.5 mt-4 block text-xs font-semibold tracking-wide text-ink/70">
          {dict.creatorDash.withdrawAmountLabel}
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
        />
        <label className="mb-1.5 mt-4 block text-xs font-semibold tracking-wide text-ink/70">{dict.creatorDash.fieldPayoutMethod}</label>
        <div className="flex gap-2">
          {(["wallet", "instapay", "bank_account"] as const).map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setPayoutMethod(method)}
              className={`flex-1 rounded-full border px-3 py-2 text-xs font-medium ${
                payoutMethod === method ? "border-primary-500 bg-primary-50 text-primary-700" : "border-line text-ink/65"
              }`}
            >
              {methodLabel(dict, method)}
            </button>
          ))}
        </div>
        <label className="mb-1.5 mt-4 block text-xs font-semibold tracking-wide text-ink/70">{dict.creatorDash.fieldPayoutAccount}</label>
        <input
          value={payoutAccountNumber}
          onChange={(e) => setPayoutAccountNumber(e.target.value)}
          className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
        />
        {createError && (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-danger">
            <AlertCircle size={13} />
            {createError}
          </p>
        )}
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => setCreateOpen(false)}
            className="flex-1 rounded-full border border-line py-2.5 text-sm font-medium text-ink/70"
          >
            {dict.common.cancel}
          </button>
          <button
            onClick={submitCreate}
            disabled={creating}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary-500 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {creating && <Loader2 size={14} className="animate-spin" />}
            {dict.common.requestWithdrawal}
          </button>
        </div>
      </Modal>

      {/* Details */}
      <Modal open={detailsFor !== null} onClose={() => setDetailsFor(null)}>
        <h3 className="text-base font-bold text-ink">{dict.creatorDash.withdrawDetailsTitle}</h3>
        {detailsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={22} className="animate-spin text-primary-500" />
          </div>
        ) : details ? (
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-ink/55">{dict.common.amount}</span>
              <span className="font-mono font-semibold text-ink">{formatPrice(details.amount, locale)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink/55">{dict.creatorDash.fieldPayoutMethod}</span>
              <span className="font-medium text-ink">{methodLabel(dict, details.payoutMethod)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink/55">{dict.creatorDash.fieldPayoutAccount}</span>
              <span dir="ltr" className="font-mono font-medium text-ink">{details.payoutAccountNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink/55">{dict.common.status}</span>
              <Badge tone={statusTone(details.status)}>{statusLabel(dict, details.status)}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink/55">{dict.creatorDash.withdrawRequestedAt}</span>
              <span className="text-ink">{details.requestedAt}</span>
            </div>
            {details.approvedAt && (
              <div className="flex items-center justify-between">
                <span className="text-ink/55">{dict.creatorDash.withdrawApprovedAt}</span>
                <span className="text-ink">{details.approvedAt}</span>
              </div>
            )}
            {details.adminPaymentProof && (
              <div>
                <p className="mb-1.5 text-ink/55">{dict.creatorDash.withdrawProof}</p>
                <img src={details.adminPaymentProof} alt="" className="h-32 w-full rounded-xl object-cover" />
              </div>
            )}
          </div>
        ) : (
          <p className="mt-4 text-sm text-ink/65">{dict.common.empty}</p>
        )}
        <button
          onClick={() => setDetailsFor(null)}
          className="mt-6 w-full rounded-full border border-line py-2.5 text-sm font-medium text-ink/70"
        >
          {dict.common.close}
        </button>
      </Modal>

      {/* Delete confirm */}
      <Modal open={confirmDeleteId !== null} onClose={() => setConfirmDeleteId(null)}>
        <h3 className="text-base font-bold text-ink">{dict.creatorDash.withdrawDeleteConfirm}</h3>
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => setConfirmDeleteId(null)}
            className="flex-1 rounded-full border border-line py-2.5 text-sm font-medium text-ink/70"
          >
            {dict.common.cancel}
          </button>
          <button
            onClick={confirmDelete}
            disabled={deleting}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-danger py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {deleting && <Loader2 size={14} className="animate-spin" />}
            {dict.common.delete}
          </button>
        </div>
      </Modal>
    </div>
  );
}
