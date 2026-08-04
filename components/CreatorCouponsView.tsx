"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2, Pencil, Plus, Tag, Trash2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { CreatorCoupon } from "@/lib/api-types";
import { couponExpiryToInputValue, couponExpiryToApiValue } from "@/lib/api-types";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { couponFormSchema, collectIssues } from "@/lib/validation/creatorForms";
import { Table, Thead, Th, Tr, Td } from "./Table";
import Badge from "./Badge";
import EmptyState from "./EmptyState";
import DashboardPageHeader from "./DashboardPageHeader";
import Modal from "./motion/Modal";
import Pagination from "./Pagination";
import FormField, { fieldInputClass } from "./FormField";

interface CouponFormState {
  code: string;
  discountPercentage: string;
  limitUses: string;
  expiredAt: string;
}

// limitUses defaults to a real value, not blank — confirmed via live
// testing that the backend rejects a missing limit_uses with a 422 even
// though the spec's own table marks it optional (see couponFormSchema).
const emptyForm: CouponFormState = { code: "", discountPercentage: "10", limitUses: "10", expiredAt: "" };

// GET /creators/coupons is the one creator-CRUD list endpoint this project
// has that's actually paginated by the backend (like communities/creators),
// not just a flat array — real Pagination component reused here.
// `expired_at` needs converting in both directions: GET returns a
// human-display 12-hour string ("2026-09-19 12:00 AM"), but the create/
// update request wants a plain 24-hour "Y-m-d H:i:s" string — see
// couponExpiryToInputValue/couponExpiryToApiValue in lib/api-types.ts.
// Both limit_uses and expired_at are documented optional but aren't in
// practice — confirmed via live testing (round 13) that omitting either one
// breaks the real backend (a clean 422 for limit_uses, a bare 500 server
// crash for expired_at). Both are treated as required in this form as a
// result — see the comment on couponFormSchema for the full story.
export default function CreatorCouponsView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { user, getMyCoupons, saveCreatorCoupon, deleteCouponByCreator } = useAuth();

  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState<CreatorCoupon[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponFormState>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function load() {
    if (!user || user.role !== "creator") {
      setLoading(false);
      return;
    }
    setLoading(true);
    const result = await getMyCoupons(locale, page);
    setCoupons(result.items);
    setLastPage(result.lastPage);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, locale, page]);

  if (!user || user.role !== "creator") return null;

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFieldErrors({});
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(coupon: CreatorCoupon) {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      discountPercentage: String(coupon.discountPercentage),
      limitUses: coupon.limitUses != null ? String(coupon.limitUses) : "",
      expiredAt: coupon.expiredAt ? couponExpiryToInputValue(coupon.expiredAt) : ""
    });
    setFieldErrors({});
    setFormError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const schema = couponFormSchema({
      required: dict.changePassword.requiredError,
      positive: dict.validation.positiveNumber,
      percentRange: dict.validation.percentRange
    });
    const parsed = schema.safeParse({
      code: form.code,
      discountPercentage: Number(form.discountPercentage) || 0,
      limitUses: form.limitUses ? Number(form.limitUses) : undefined,
      expiredAt: form.expiredAt
    });
    if (!parsed.success) {
      setFieldErrors(collectIssues(parsed.error.issues));
      return;
    }
    setFieldErrors({});
    setFormError("");
    setSaving(true);
    try {
      await saveCreatorCoupon(
        {
          code: parsed.data.code,
          discountPercentage: parsed.data.discountPercentage,
          limitUses: parsed.data.limitUses,
          expiredAt: couponExpiryToApiValue(parsed.data.expiredAt)
        },
        editingId,
        locale
      );
      closeModal();
      await load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : dict.creatorDash.couponError);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirmId) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteCouponByCreator(confirmId, locale);
      setConfirmId(null);
      await load();
    } catch {
      setDeleteError(dict.creatorDash.couponDeleteError);
    } finally {
      setDeleting(false);
    }
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

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-ink/50">
          <Loader2 size={16} className="animate-spin" />
          {dict.creatorDash.couponsLoading}
        </div>
      ) : coupons.length === 0 ? (
        <EmptyState icon={Tag} title={dict.common.empty} />
      ) : (
        <>
          <Table>
            <Thead>
              <Th>{dict.creatorDash.fieldCouponCode}</Th>
              <Th>{dict.creatorDash.fieldCouponDiscount}</Th>
              <Th>{dict.creatorDash.fieldCouponExpiry}</Th>
              <Th>{dict.common.status}</Th>
              <Th>{dict.common.actions}</Th>
            </Thead>
            <tbody>
              {coupons.map((coupon) => {
                const expiryInput = coupon.expiredAt ? couponExpiryToInputValue(coupon.expiredAt) : "";
                const expired = expiryInput ? new Date(expiryInput).getTime() <= Date.now() : false;
                return (
                  <Tr key={coupon.id}>
                    <Td className="font-mono font-medium text-ink">{coupon.code}</Td>
                    <Td className="font-mono">%{coupon.discountPercentage}</Td>
                    <Td>{coupon.expiredAt ?? "—"}</Td>
                    <Td>
                      <Badge tone={expired ? "danger" : "success"}>
                        {expired ? dict.creatorDash.couponExpired : dict.common.active}
                      </Badge>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEdit(coupon)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/50 hover:bg-primary-50 hover:text-primary-700"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setConfirmId(coupon.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/50 hover:bg-danger/10 hover:text-danger"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
          <Pagination page={page} totalPages={lastPage} onChange={setPage} dict={dict} />
        </>
      )}

      <Modal open={modalOpen} onClose={closeModal} panelClassName="space-y-4">
        <form onSubmit={submit} className="space-y-4">
          <h3 className="text-base font-bold text-ink">
            {editingId ? dict.creatorDash.editCoupon : dict.creatorDash.newCoupon}
          </h3>

          <FormField label={dict.creatorDash.fieldCouponCode} error={fieldErrors.code}>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              dir="ltr"
              className={`${fieldInputClass(!!fieldErrors.code)} font-mono`}
            />
          </FormField>

          <FormField label={dict.creatorDash.fieldCouponDiscount} error={fieldErrors.discountPercentage}>
            <input
              type="number"
              value={form.discountPercentage}
              onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })}
              className={fieldInputClass(!!fieldErrors.discountPercentage)}
            />
          </FormField>

          <FormField label={dict.creatorDash.fieldCouponLimitUses} error={fieldErrors.limitUses}>
            <input
              type="number"
              min={1}
              value={form.limitUses}
              onChange={(e) => setForm({ ...form, limitUses: e.target.value })}
              className={fieldInputClass(!!fieldErrors.limitUses)}
            />
          </FormField>

          <FormField label={dict.creatorDash.fieldCouponExpiry} error={fieldErrors.expiredAt}>
            <input
              type="datetime-local"
              value={form.expiredAt}
              onChange={(e) => setForm({ ...form, expiredAt: e.target.value })}
              className={fieldInputClass(!!fieldErrors.expiredAt)}
            />
          </FormField>

          {formError && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-danger">
              <AlertCircle size={14} />
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-full border border-line px-4 py-2.5 text-sm font-medium text-ink/70"
            >
              {dict.common.cancel}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 rounded-full bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editingId ? dict.common.save : dict.creatorDash.couponCreateButton}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!confirmId}
        onClose={() => {
          setConfirmId(null);
          setDeleteError("");
        }}
      >
        <h3 className="text-base font-bold text-ink">{dict.common.delete}?</h3>
        {deleteError && <p className="mt-2 text-sm font-medium text-danger">{deleteError}</p>}
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => {
              setConfirmId(null);
              setDeleteError("");
            }}
            className="flex-1 rounded-full border border-line py-2.5 text-sm font-medium text-ink/70"
          >
            {dict.common.cancel}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 rounded-full bg-danger py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {dict.common.delete}
          </button>
        </div>
      </Modal>
    </div>
  );
}
