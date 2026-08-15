"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ImagePlus, Loader2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { Category } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import {
  courseCreateFormSchema,
  collectIssues,
  apiFieldErrors,
} from "@/lib/validation/creatorForms";

const API_FIELD_MAP: Record<string, string> = {
  category_id: "categoryId",
  title: "title",
  description: "description",
  price: "price",
  discount_percentage: "discountPercentage",
  intro_video_url: "introVideoUrl",
  image: "image",
};
import FormField, { fieldInputClass } from "./FormField";
import PageLoader from "./PageLoader";
import ImageCropper from "./ImageCropper";

export default function NewCourseView({
  locale,
  dict,
  categories,
}: {
  locale: Locale;
  dict: Dictionary;
  categories: Category[];
}) {
  const router = useRouter();
  const { user, getMyCommunity, createCourse } = useAuth();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [checkingCommunity, setCheckingCommunity] = useState(true);
  const [hasCommunity, setHasCommunity] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [price, setPrice] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [introVideoUrl, setIntroVideoUrl] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [cropSourceFile, setCropSourceFile] = useState<File | null>(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!user || user.role !== "creator") {
      setCheckingCommunity(false);
      return;
    }
    getMyCommunity(locale).then((community) => {
      if (!cancelled) {
        setHasCommunity(!!community);
        setCheckingCommunity(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id, locale]);

  if (!user || user.role !== "creator") return null;

  if (checkingCommunity) {
    return <PageLoader />;
  }

  if (!hasCommunity) {
    return (
      <div className="w-full rounded-2xl border border-line bg-surface p-6 shadow-card">
        <h1 className="text-xl font-bold text-ink">
          {dict.creatorDash.addCourseTitle}
        </h1>
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-accent-50 px-3.5 py-3 text-sm text-accent-800">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {dict.creatorDash.courseNeedsCommunityFirst}
        </p>
        <Link
          href={`/${locale}/creator/community`}
          className="mt-5 inline-flex items-center justify-center rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
        >
          {dict.creatorDash.myCommunityTitle}
        </Link>
      </div>
    );
  }

  function handleCropConfirm(blob: Blob) {
    const file = new File([blob], "course.jpg", { type: "image/jpeg" });
    setImage(file);
    setImagePreviewUrl(URL.createObjectURL(blob));
    setCropSourceFile(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const schema = courseCreateFormSchema({
      required: dict.changePassword.requiredError,
      positive: dict.validation.positiveNumber,
      percentRange: dict.validation.percentRange,
      invalidUrl: dict.validation.invalidUrl,
    });
    const parsed = schema.safeParse({
      title,
      categoryId,
      isFree,
      price: price ? Number(price) : 0,
      discountPercentage: Number(discountPercentage) || 0,
      introVideoUrl,
    });
    if (!parsed.success) {
      setFieldErrors(collectIssues(parsed.error.issues));
      return;
    }
    setFieldErrors({});

    setSaving(true);
    try {
      const created = await createCourse(
        {
          categoryId,
          title,
          description: description.trim() || undefined,
          image: image ?? undefined,
          price: isFree ? undefined : Number(price),
          discountPercentage: isFree
            ? undefined
            : Number(discountPercentage) || 0,
          introVideoUrl: introVideoUrl || undefined,
          isFree,
        },
        locale,
      );
      router.push(`/${locale}/creator/courses/${created.id}/edit`);
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors((prev) => ({
          ...prev,
          ...apiFieldErrors(err.fieldErrors, API_FIELD_MAP),
        }));
        setError(err.message);
      } else {
        setError(dict.creatorDash.courseError);
      }
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="w-full space-y-5 rounded-2xl border border-line bg-surface p-6 shadow-card"
    >
      <h1 className="text-xl font-bold text-ink">
        {dict.creatorDash.addCourseTitle}
      </h1>

      <FormField label={dict.creatorDash.fieldTitle} error={fieldErrors.title}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={fieldInputClass(!!fieldErrors.title)}
        />
      </FormField>

      <FormField label={dict.creatorDash.fieldDesc}>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${fieldInputClass()} resize-none`}
        />
      </FormField>

      <FormField
        label={dict.creatorDash.fieldCategory}
        error={fieldErrors.categoryId}
      >
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
        <span className="mb-1.5 block text-xs font-medium text-ink/65">
          {dict.creatorDash.fieldCourseImage}
        </span>
        <div className="relative mb-3 flex h-44 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-paper sm:h-56">
          {imagePreviewUrl ? (
            <img
              src={imagePreviewUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <ImagePlus size={28} className="text-ink/30" />
          )}
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="absolute end-3 top-3 rounded-full bg-ink/60 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur hover:bg-ink/75"
          >
            {dict.common.changeCover}
          </button>
          <span className="absolute bottom-2 left-2 rounded-md bg-ink/60 px-2 py-1 text-[11px] font-medium text-white backdrop-blur">
            1200 × 400
          </span>
          <input
            ref={imageInputRef}
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

      <label className="flex items-center gap-2 text-sm text-ink/70">
        <input
          type="checkbox"
          checked={isFree}
          onChange={(e) => setIsFree(e.target.checked)}
          className="h-4 w-4 rounded border-line"
        />
        {dict.creatorDash.fieldCourseIsFree}
      </label>

      {!isFree && (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label={dict.creatorDash.fieldPrice}
            error={fieldErrors.price}
          >
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder=""
              className={fieldInputClass(!!fieldErrors.price)}
            />
          </FormField>
          <FormField
            label={dict.creatorDash.fieldCourseDiscount}
            error={fieldErrors.discountPercentage}
          >
            <input
              type="number"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(e.target.value)}
              placeholder=""
              className={fieldInputClass(!!fieldErrors.discountPercentage)}
            />
          </FormField>
        </div>
      )}

      <FormField
        label={dict.creatorDash.fieldIntroUrl}
        error={fieldErrors.introVideoUrl}
      >
        <input
          dir="ltr"
          value={introVideoUrl}
          onChange={(e) => setIntroVideoUrl(e.target.value)}
          className={fieldInputClass(!!fieldErrors.introVideoUrl)}
        />
      </FormField>

      {error && (
        <p className="flex items-center gap-1.5 text-sm font-medium text-danger">
          <AlertCircle size={14} />
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push(`/${locale}/creator/courses`)}
          className="flex-1 rounded-full border border-line py-2.5 text-sm font-medium text-ink/70 sm:flex-none sm:px-6"
        >
          {dict.common.cancel}
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary-500 py-2.5 text-sm font-semibold text-white sm:flex-none sm:px-6 disabled:opacity-60"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {dict.creatorDash.courseCreateButton}
        </button>
      </div>

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
    </form>
  );
}
