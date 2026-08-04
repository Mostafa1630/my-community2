"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, Star } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";

export default function CommunityReviewForm({
  communityId,
  locale,
  dict
}: {
  communityId: string;
  locale: Locale;
  dict: Dictionary;
}) {
  const router = useRouter();
  const { role, createReview } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  if (role !== "student") {
    return (
      <Link
        href={`/${locale}/login`}
        className="mt-4 inline-block text-sm font-medium text-primary-700 link-underline"
      >
        {dict.communityDetails.loginToReview}
      </Link>
    );
  }

  if (submitted) {
    return (
      <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-success">
        <CheckCircle2 size={15} />
        {dict.communityDetails.reviewSubmitted}
      </p>
    );
  }

  async function handleSubmit() {
    if (rating < 1) return;
    setSubmitting(true);
    setError("");
    try {
      await createReview(
        { id: communityId, type: "community", rating, comment: comment.trim() || undefined },
        locale
      );
      setSubmitted(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : dict.communityDetails.reviewError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-line bg-surface p-4">
      <p className="mb-2 text-sm font-semibold text-ink">{dict.communityDetails.ratingLabel}</p>
      <div className="flex gap-1" dir="ltr">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            onMouseEnter={() => setHoverRating(value)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-0.5"
          >
            <Star
              size={22}
              className={value <= (hoverRating || rating) ? "fill-accent-400 text-accent-400" : "text-ink/25"}
            />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={dict.communityDetails.reviewPlaceholder}
        rows={3}
        className="mt-3 w-full resize-none rounded-xl border border-line bg-surface px-3.5 py-2 text-sm outline-none focus:border-primary-300"
      />
      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-danger">
          <AlertCircle size={13} />
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || rating < 1}
        className="mt-3 flex items-center gap-1.5 rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
      >
        {submitting && <Loader2 size={14} className="animate-spin" />}
        {dict.communityDetails.submitReview}
      </button>
    </div>
  );
}
