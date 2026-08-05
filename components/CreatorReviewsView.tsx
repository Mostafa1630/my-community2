"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle2, Eye, Loader2, Star, Trash2, Users2, XCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { CreatorReview } from "@/lib/api-types";
import { useAuth } from "@/lib/auth-context";
import { Table, Thead, Th, Tr, Td } from "./Table";
import Badge from "./Badge";
import EmptyState from "./EmptyState";
import DashboardPageHeader from "./DashboardPageHeader";
import Modal from "./motion/Modal";

type Tab = "all" | "pending" | "approved";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1 font-mono text-sm text-ink" dir="ltr">
      <Star size={13} className="fill-accent-400 text-accent-400" />
      {rating}
    </span>
  );
}

function ReviewableLink({ review, locale }: { review: CreatorReview; locale: Locale }) {
  const href =
    review.type === "course" ? `/${locale}/courses/${review.reviewable.id}` : `/${locale}/communities/${review.reviewable.id}`;
  return (
    <Link href={href} className="flex items-center gap-1.5 text-xs text-ink/70 hover:text-primary-700 link-underline">
      {review.type === "course" ? <BookOpen size={12} className="shrink-0" /> : <Users2 size={12} className="shrink-0" />}
      <span className="truncate">{review.reviewable.name}</span>
    </Link>
  );
}

// GET /creators/reviews returns everything a moderation table needs
// (rating/comment/user/type/reviewable/is_approved) in one call, so the
// list itself never needs a per-row extra fetch. GET /creators/reviews/{id}
// (get one) is still put to real use though — opening the details modal
// re-fetches that one review fresh rather than trusting already-loaded list
// state, same reasoning as the lesson edit modal in round 12.
export default function CreatorReviewsView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { user, getMyReviews, getReviewByCreator, moderateReview, deleteReviewByCreator } = useAuth();

  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<CreatorReview[]>([]);
  const [tab, setTab] = useState<Tab>("all");

  const [detailId, setDetailId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CreatorReview | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [actingId, setActingId] = useState<string | null>(null);
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({});

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function load() {
    if (!user || user.role !== "creator") {
      setLoading(false);
      return;
    }
    const items = await getMyReviews(locale);
    setReviews(items);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, locale]);

  if (!user || user.role !== "creator") return null;

  const filtered = reviews.filter((r) => tab === "all" || (tab === "approved" ? r.isApproved : !r.isApproved));

  async function openDetail(id: string) {
    setDetailId(id);
    setDetail(null);
    setDetailLoading(true);
    const full = await getReviewByCreator(id, locale);
    setDetail(full);
    setDetailLoading(false);
  }

  async function handleModerate(id: string, approve: boolean) {
    setActingId(id);
    setActionErrors((prev) => ({ ...prev, [id]: "" }));
    try {
      await moderateReview(id, approve, locale);
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, isApproved: approve } : r)));
      setDetail((prev) => (prev && prev.id === id ? { ...prev, isApproved: approve } : prev));
    } catch {
      setActionErrors((prev) => ({ ...prev, [id]: dict.creatorDash.reviewActionError }));
    } finally {
      setActingId(null);
    }
  }

  async function handleDelete() {
    if (!confirmDeleteId) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteReviewByCreator(confirmDeleteId, locale);
      setReviews((prev) => prev.filter((r) => r.id !== confirmDeleteId));
      if (detailId === confirmDeleteId) {
        setDetailId(null);
        setDetail(null);
      }
      setConfirmDeleteId(null);
    } catch {
      setDeleteError(dict.creatorDash.reviewDeleteError);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <DashboardPageHeader title={dict.creatorDash.reviewsTitle} subtitle={dict.creatorDash.reviewsSubtitle} />

      <div className="mb-6 flex gap-2">
        {(["all", "pending", "approved"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              tab === t ? "border-primary-500 bg-primary-500 text-white" : "border-line text-ink/65"
            }`}
          >
            {t === "all" ? dict.common.all : t === "pending" ? dict.creatorDash.reviewsPending : dict.creatorDash.reviewsApproved}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-ink/65">
          <Loader2 size={16} className="animate-spin" />
          {dict.creatorDash.reviewsLoading}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Star} title={dict.creatorDash.reviewsEmpty} />
      ) : (
        <Table>
          <Thead>
            <Th>{dict.creatorDash.fieldReviewRating}</Th>
            <Th>{dict.creatorDash.fieldReviewComment}</Th>
            <Th>{dict.creatorDash.fieldReviewFrom}</Th>
            <Th>{dict.creatorDash.fieldReviewOn}</Th>
            <Th>{dict.common.status}</Th>
            <Th>{dict.common.actions}</Th>
          </Thead>
          <tbody>
            {filtered.map((review) => (
              <Tr key={review.id}>
                <Td>
                  <Stars rating={review.rating} />
                </Td>
                <Td className="max-w-[220px] truncate text-ink/70">{review.comment || "—"}</Td>
                <Td>{review.user.name}</Td>
                <Td className="max-w-[160px]">
                  <ReviewableLink review={review} locale={locale} />
                </Td>
                <Td>
                  <Badge tone={review.isApproved ? "success" : "pending"}>
                    {review.isApproved ? dict.creatorDash.reviewsApproved : dict.creatorDash.reviewsPending}
                  </Badge>
                </Td>
                <Td>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openDetail(review.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/65 hover:bg-primary-50 hover:text-primary-700"
                      title={dict.common.viewDetails}
                    >
                      <Eye size={15} />
                    </button>
                    {review.isApproved ? (
                      <button
                        onClick={() => handleModerate(review.id, false)}
                        disabled={actingId === review.id}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/65 hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                        title={dict.creatorDash.reviewReject}
                      >
                        <XCircle size={15} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleModerate(review.id, true)}
                        disabled={actingId === review.id}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/65 hover:bg-success/10 hover:text-success disabled:opacity-50"
                        title={dict.creatorDash.reviewApprove}
                      >
                        <CheckCircle2 size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => setConfirmDeleteId(review.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/65 hover:bg-danger/10 hover:text-danger"
                      title={dict.common.delete}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  {actionErrors[review.id] && <p className="mt-1 text-xs text-danger">{actionErrors[review.id]}</p>}
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={!!detailId} onClose={() => { setDetailId(null); setDetail(null); }}>
        {detailLoading || !detail ? (
          <div className="flex items-center gap-2 py-6 text-sm text-ink/65">
            <Loader2 size={16} className="animate-spin" />
            {dict.creatorDash.reviewsLoading}
          </div>
        ) : (
          <div className="space-y-3">
            <Stars rating={detail.rating} />
            <p className="text-sm leading-6 text-ink/80">{detail.comment || dict.creatorDash.reviewNoComment}</p>
            <div className="flex items-center justify-between border-t border-line pt-3 text-xs text-ink/65">
              <span>{detail.user.name}</span>
              <ReviewableLink review={detail} locale={locale} />
            </div>
            {actionErrors[detail.id] && <p className="text-xs text-danger">{actionErrors[detail.id]}</p>}
            <div className="flex gap-2 pt-2">
              {detail.isApproved ? (
                <button
                  onClick={() => handleModerate(detail.id, false)}
                  disabled={actingId === detail.id}
                  className="flex items-center gap-1.5 rounded-full border border-danger px-4 py-2 text-sm font-semibold text-danger disabled:opacity-50"
                >
                  {actingId === detail.id && <Loader2 size={13} className="animate-spin" />}
                  {dict.creatorDash.reviewReject}
                </button>
              ) : (
                <button
                  onClick={() => handleModerate(detail.id, true)}
                  disabled={actingId === detail.id}
                  className="flex items-center gap-1.5 rounded-full bg-success px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {actingId === detail.id && <Loader2 size={13} className="animate-spin" />}
                  {dict.creatorDash.reviewApprove}
                </button>
              )}
              <button
                onClick={() => setConfirmDeleteId(detail.id)}
                className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink/70"
              >
                {dict.common.delete}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!confirmDeleteId}
        onClose={() => {
          setConfirmDeleteId(null);
          setDeleteError("");
        }}
      >
        <h3 className="text-base font-bold text-ink">{dict.common.delete}?</h3>
        {deleteError && <p className="mt-2 text-sm font-medium text-danger">{deleteError}</p>}
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => {
              setConfirmDeleteId(null);
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
