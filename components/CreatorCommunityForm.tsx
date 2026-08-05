"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Users2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { Category } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { communityFormSchema, collectIssues } from "@/lib/validation/creatorForms";
import EmptyState from "./EmptyState";
import DashboardPageHeader from "./DashboardPageHeader";
import FormField, { fieldInputClass } from "./FormField";

export default function CreatorCommunityForm({
  locale,
  dict,
  categories
}: {
  locale: Locale;
  dict: Dictionary;
  categories: Category[];
}) {
  const { user, saveCommunity, getMyCommunity } = useAuth();

  const [loading, setLoading] = useState(true);
  const [communityId, setCommunityId] = useState<string | null>(null);

  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categoryUnresolved, setCategoryUnresolved] = useState(false);
  const [type, setType] = useState<"public" | "private">("public");
  const [isFree, setIsFree] = useState(false);
  const [subscriptionPrice, setSubscriptionPrice] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [durationDays, setDurationDays] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [currentCoverImage, setCurrentCoverImage] = useState<string | undefined>(undefined);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [justCreated, setJustCreated] = useState(false);
  const [error, setError] = useState("");

  // GET /creators/communities (round 12) returns the real bilingual
  // name/description pair and the real category_id in one call — no more
  // double-locale-fetching or best-effort category-name-matching needed
  // (both were workarounds for the gap this endpoint closes).
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user || user.role !== "creator") {
        setLoading(false);
        return;
      }
      const community = await getMyCommunity(locale);
      if (cancelled) return;
      if (community) {
        setCommunityId(community.id);
        setNameEn(community.nameEn);
        setNameAr(community.nameAr);
        setDescriptionEn(community.descriptionEn);
        setDescriptionAr(community.descriptionAr);
        setType(community.type);
        setIsFree(community.isFree);
        setSubscriptionPrice(community.subscriptionPrice);
        setDiscountPercentage(community.discountPercentage);
        setCurrentCoverImage(community.coverImage);
        if (categories.some((c) => c.id === community.categoryId)) {
          setCategoryId(community.categoryId);
        } else {
          setCategoryUnresolved(true);
        }
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, locale]);

  if (!user || user.role !== "creator") {
    return <EmptyState icon={Users2} title={dict.common.empty} />;
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-10 text-sm text-ink/65">
        <Loader2 size={16} className="animate-spin" />
        {dict.creatorDash.communityLoading}
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!categoryId) {
      setFieldErrors({ categoryId: dict.creatorDash.communityCategoryUnresolved });
      setCategoryUnresolved(true);
      return;
    }

    const schema = communityFormSchema({
      required: dict.changePassword.requiredError,
      positive: dict.validation.positiveNumber,
      percentRange: dict.validation.percentRange
    });
    const parsed = schema.safeParse({
      nameEn,
      nameAr,
      descriptionEn,
      descriptionAr,
      categoryId,
      type,
      isFree,
      subscriptionPrice,
      discountPercentage,
      subscriptionDurationDays: durationDays ? Number(durationDays) : undefined
    });
    if (!parsed.success) {
      setFieldErrors(collectIssues(parsed.error.issues));
      return;
    }
    setFieldErrors({});

    setSaving(true);
    // Captured before the call, not read back from `communityId` afterwards —
    // saveCommunity's success handler sets communityId to the new id in the
    // same batch as `saved`, so by render time communityId is always truthy
    // and a ternary keyed off it would show "saved" even on a genuine first
    // create. wasJustCreated is the fix.
    const wasCreating = !communityId;
    try {
      const result = await saveCommunity(
        {
          categoryId,
          nameEn,
          nameAr,
          descriptionEn: descriptionEn.trim() || undefined,
          descriptionAr: descriptionAr.trim() || undefined,
          coverImage: coverImage ?? undefined,
          type,
          isFree,
          subscriptionPrice: isFree ? undefined : subscriptionPrice,
          discountPercentage: isFree ? undefined : discountPercentage,
          subscriptionDurationDays: durationDays ? Number(durationDays) : undefined
        },
        communityId,
        locale
      );
      setCommunityId(result.id);
      setCurrentCoverImage(result.coverImage);
      setCoverImage(null);
      setCategoryUnresolved(false);
      setJustCreated(wasCreating);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : dict.creatorDash.communityError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full">
      <DashboardPageHeader title={dict.creatorDash.myCommunityTitle} subtitle={dict.creatorDash.myCommunitySubtitle} />

      {!communityId && <p className="mb-4 text-sm text-ink/65">{dict.creatorDash.communityNoneYet}</p>}

      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-line bg-surface p-6 shadow-card">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={dict.creatorDash.fieldCommunityNameEn} error={fieldErrors.nameEn}>
            <input
              dir="ltr"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className={fieldInputClass(!!fieldErrors.nameEn)}
            />
          </FormField>
          <FormField label={dict.creatorDash.fieldCommunityNameAr} error={fieldErrors.nameAr}>
            <input
              dir="rtl"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              className={fieldInputClass(!!fieldErrors.nameAr)}
            />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={dict.creatorDash.fieldCommunityDescEn} error={fieldErrors.descriptionEn}>
            <textarea
              dir="ltr"
              rows={3}
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              className={`${fieldInputClass(!!fieldErrors.descriptionEn)} resize-none`}
            />
          </FormField>
          <FormField label={dict.creatorDash.fieldCommunityDescAr} error={fieldErrors.descriptionAr}>
            <textarea
              dir="rtl"
              rows={3}
              value={descriptionAr}
              onChange={(e) => setDescriptionAr(e.target.value)}
              className={`${fieldInputClass(!!fieldErrors.descriptionAr)} resize-none`}
            />
          </FormField>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink/65">{dict.creatorDash.fieldCommunityCategory}</span>
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setCategoryUnresolved(false);
              setFieldErrors((prev) => ({ ...prev, categoryId: "" }));
            }}
            className={fieldInputClass(!!fieldErrors.categoryId || categoryUnresolved)}
          >
            <option value="" disabled>
              {dict.creatorDash.communityCategoryPlaceholder}
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {locale === "ar" ? c.nameAr : c.nameEn}
              </option>
            ))}
          </select>
          {(fieldErrors.categoryId || categoryUnresolved) && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-danger">
              <AlertCircle size={13} />
              {fieldErrors.categoryId || dict.creatorDash.communityCategoryUnresolved}
            </p>
          )}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink/65">{dict.creatorDash.fieldCommunityCoverImage}</span>
          {currentCoverImage && !coverImage && (
            <img src={currentCoverImage} alt="" className="mb-2 h-28 w-full rounded-xl object-cover" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-ink/70"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink/65">{dict.creatorDash.fieldCommunityType}</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType("public")}
                className={`flex-1 rounded-full border px-3 py-2 text-xs font-medium ${
                  type === "public" ? "border-primary-500 bg-primary-50 text-primary-700" : "border-line text-ink/65"
                }`}
              >
                {dict.creatorDash.communityTypePublic}
              </button>
              <button
                type="button"
                onClick={() => setType("private")}
                className={`flex-1 rounded-full border px-3 py-2 text-xs font-medium ${
                  type === "private" ? "border-primary-500 bg-primary-50 text-primary-700" : "border-line text-ink/65"
                }`}
              >
                {dict.creatorDash.communityTypePrivate}
              </button>
            </div>
          </div>
          <FormField
            label={dict.creatorDash.fieldCommunityDuration}
            error={fieldErrors.subscriptionDurationDays}
            hint={!fieldErrors.subscriptionDurationDays ? dict.creatorDash.communityDurationHint : undefined}
          >
            <input
              type="number"
              min={1}
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              placeholder="30"
              className={fieldInputClass(!!fieldErrors.subscriptionDurationDays)}
            />
          </FormField>
        </div>

        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input
            type="checkbox"
            checked={isFree}
            onChange={(e) => setIsFree(e.target.checked)}
            className="h-4 w-4 rounded border-line"
          />
          {dict.creatorDash.fieldCommunityIsFree}
        </label>

        {!isFree && (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label={dict.creatorDash.fieldCommunitySubscriptionPrice} error={fieldErrors.subscriptionPrice}>
              <input
                type="number"
                value={subscriptionPrice}
                onChange={(e) => setSubscriptionPrice(Number(e.target.value) || 0)}
                className={fieldInputClass(!!fieldErrors.subscriptionPrice)}
              />
            </FormField>
            <FormField label={dict.creatorDash.fieldCommunityDiscount} error={fieldErrors.discountPercentage}>
              <input
                type="number"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(Number(e.target.value) || 0)}
                className={fieldInputClass(!!fieldErrors.discountPercentage)}
              />
            </FormField>
          </div>
        )}

        {error && (
          <p className="flex items-center gap-1.5 text-sm font-medium text-danger">
            <AlertCircle size={14} />
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-60"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {communityId ? dict.creatorDash.communitySaveButton : dict.creatorDash.communityCreateButton}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-success">
              <CheckCircle2 size={14} />
              {justCreated ? dict.creatorDash.communityCreated : dict.creatorDash.communitySaved}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
