"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ImagePlus, Loader2, Users2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { Category } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { communityFormSchema, collectIssues, apiFieldErrors } from "@/lib/validation/creatorForms";

const API_FIELD_MAP: Record<string, string> = {
  category_id: "categoryId",
  name: "name",
  description: "description",
  type: "type",
  subscription_price: "subscriptionPrice",
  discount_percentage: "discountPercentage",
  subscription_duration_days: "subscriptionDurationDays",
  cover_image: "coverImage"
};
import DashboardPageHeader from "./DashboardPageHeader";
import FormField, { fieldInputClass } from "./FormField";
import EmptyState from "./EmptyState";
import PageLoader from "./PageLoader";

// POST /creators/communities/{id} (update only — creation lives in
// NewCommunityView). No "get one community" endpoint exists, so the target
// community is resolved by fetching the full list (GET /creators/communities)
// and matching on id client-side, same as how the list page already has it.
export default function EditCommunityView({
  communityId,
  locale,
  dict,
  categories
}: {
  communityId: string;
  locale: Locale;
  dict: Dictionary;
  categories: Category[];
}) {
  const router = useRouter();
  const { user, saveCommunity, getMyCommunities } = useAuth();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categoryUnresolved, setCategoryUnresolved] = useState(false);
  const [type, setType] = useState<"public" | "private">("public");
  const [isFree, setIsFree] = useState(false);
  const [subscriptionPrice, setSubscriptionPrice] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [durationDays, setDurationDays] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [currentCoverImage, setCurrentCoverImage] = useState<string | undefined>(undefined);

  // Same reasoning as NewCommunityView: preview a newly picked file at the
  // same size the existing cover renders at, rather than leaving the
  // (much taller, now-stale) current cover showing until the save
  // round-trips.
  useEffect(() => {
    if (!coverImage) {
      setCoverPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(coverImage);
    setCoverPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [coverImage]);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user || user.role !== "creator") {
        setLoading(false);
        return;
      }
      const list = await getMyCommunities(locale);
      if (cancelled) return;
      const community = list.find((c) => c.id === communityId);
      if (!community) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setName(community.name);
      setDescription(community.description);
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
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, locale, communityId]);

  if (!user || user.role !== "creator") return null;

  if (loading) return <PageLoader />;

  if (notFound) {
    return <EmptyState icon={Users2} title={dict.creatorDash.communityError} />;
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
      name,
      description,
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
    try {
      await saveCommunity(
        {
          categoryId,
          name,
          description: description.trim() || undefined,
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
      router.push(`/${locale}/creator/community`);
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors((prev) => ({ ...prev, ...apiFieldErrors(err.fieldErrors, API_FIELD_MAP) }));
        setError(err.message);
      } else {
        setError(dict.creatorDash.communityError);
      }
      setSaving(false);
    }
  }

  return (
    <div className="w-full">
      <DashboardPageHeader title={dict.creatorDash.communityEditTitle} subtitle={dict.creatorDash.myCommunitySubtitle} />

      <form onSubmit={submit} className="space-y-6 rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
        <FormField label={dict.creatorDash.fieldCommunityName} error={fieldErrors.name}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldInputClass(!!fieldErrors.name)}
          />
        </FormField>

        <FormField label={dict.creatorDash.fieldCommunityDesc} error={fieldErrors.description}>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${fieldInputClass(!!fieldErrors.description)} resize-none`}
          />
        </FormField>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold tracking-wide text-ink/70">{dict.creatorDash.fieldCommunityCategory}</span>
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
          <span className="mb-2 block text-xs font-semibold tracking-wide text-ink/70">{dict.creatorDash.fieldCommunityCoverImage}</span>
          <div className="relative mb-3 flex h-44 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-paper sm:h-56">
            {coverPreviewUrl || currentCoverImage ? (
              <img src={coverPreviewUrl ?? currentCoverImage} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImagePlus size={28} className="text-ink/30" />
            )}
            <span className="absolute bottom-2 left-2 rounded-md bg-ink/60 px-2 py-1 text-[11px] font-medium text-white backdrop-blur">
              1200 × 400
            </span>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-ink/70"
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold tracking-wide text-ink/70">{dict.creatorDash.fieldCommunityType}</label>
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
          <div className="grid gap-5 sm:grid-cols-2">
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

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5 rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-60"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {dict.creatorDash.communitySaveButton}
        </button>
      </form>
    </div>
  );
}
