"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ImagePlus, Loader2 } from "lucide-react";
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
import ImageCropper from "./ImageCropper";


export default function NewCommunityView({
  locale,
  dict,
  categories
}: {
  locale: Locale;
  dict: Dictionary;
  categories: Category[];
}) {
  const router = useRouter();
  const { user, saveCommunity } = useAuth();
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [type, setType] = useState<"public" | "private">("public");
  const [isFree, setIsFree] = useState(false);
  const [subscriptionPrice, setSubscriptionPrice] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("10");
  const [durationDays, setDurationDays] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [cropSourceFile, setCropSourceFile] = useState<File | null>(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");


  if (!user || user.role !== "creator") return null;

  function handleCropConfirm(blob: Blob) {
    const file = new File([blob], "cover.jpg", { type: "image/jpeg" });
    setCoverImage(file);
    setCoverPreviewUrl(URL.createObjectURL(blob));
    setCropSourceFile(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

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
      subscriptionPrice: subscriptionPrice ? Number(subscriptionPrice) : 0,
      discountPercentage: Number(discountPercentage) || 0,
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
          subscriptionPrice: isFree ? undefined : Number(subscriptionPrice),
          discountPercentage: isFree ? undefined : Number(discountPercentage) || 0,
          subscriptionDurationDays: durationDays ? Number(durationDays) : undefined
        },
        null,
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
      <DashboardPageHeader title={dict.creatorDash.communityCreateButton} subtitle={dict.creatorDash.myCommunitySubtitle} />

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

        <FormField label={dict.creatorDash.fieldCommunityCategory} error={fieldErrors.categoryId}>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={fieldInputClass(!!fieldErrors.categoryId)}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {locale === "ar" ? c.nameAr : c.nameEn}
              </option>
            ))}
          </select>
        </FormField>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold tracking-wide text-ink/70">{dict.creatorDash.fieldCommunityCoverImage}</span>
          <div className="relative mb-3 flex h-44 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-paper sm:h-56">
            {coverPreviewUrl ? (
              <img src={coverPreviewUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImagePlus size={28} className="text-ink/30" />
            )}
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="absolute end-3 top-3 rounded-full bg-ink/60 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur hover:bg-ink/75"
            >
              {dict.common.changeCover}
            </button>
            <span className="absolute bottom-2 left-2 flex items-center justify-center rounded-md bg-ink/60 px-2 py-1 text-center text-[11px] font-medium text-white backdrop-blur">
              1200 × 400
            </span>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                if (file) setCropSourceFile(file);
                e.target.value = "";
              }}
            />
          </div>
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
                onChange={(e) => setSubscriptionPrice(e.target.value)}
                placeholder=""
                className={fieldInputClass(!!fieldErrors.subscriptionPrice)}
              />
            </FormField>
            <FormField label={dict.creatorDash.fieldCommunityDiscount} error={fieldErrors.discountPercentage}>
              <input
                type="number"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                placeholder="10"
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
          {dict.creatorDash.communityCreateButton}
        </button>
      </form>

      {cropSourceFile && (
        <ImageCropper
          file={cropSourceFile}
          aspect={3}
          shape="rect"
          outputSize={{ width: 1200, height: 400 }}
          dict={dict}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropSourceFile(null)}
        />
      )}
    </div>
  );
}
