"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { Category } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { courseCreateFormSchema, collectIssues } from "@/lib/validation/creatorForms";
import FormField, { fieldInputClass } from "./FormField";
import PageLoader from "./PageLoader";

// POST /creators/courses (round 12) — previously this page just showed a
// "not connected" notice since only update/delete existed (round 10).
// category_id is genuinely required here, unlike the edit form where it's
// left as an unresolvable "leave unchanged" placeholder — on create there's
// no existing course to protect, so the creator just picks one fresh.
//
// Live-testing (round 13) found a real backend crash, not a validation
// error: POST /creators/courses returns a bare 500 "An error occurred" if
// the authenticated creator has no community yet (confirmed by creating one
// for the same account and retrying — same request then succeeds). Rather
// than let a creator hit that opaque 500, this checks getMyCommunity() up
// front and blocks the form with a link to /creator/community instead.
export default function NewCourseView({
  locale,
  dict,
  categories
}: {
  locale: Locale;
  dict: Dictionary;
  categories: Category[];
}) {
  const router = useRouter();
  const { user, getMyCommunity, createCourse } = useAuth();

  const [checkingCommunity, setCheckingCommunity] = useState(true);
  const [hasCommunity, setHasCommunity] = useState(true);

  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [price, setPrice] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [introVideoUrl, setIntroVideoUrl] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [image, setImage] = useState<File | null>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, locale]);

  if (!user || user.role !== "creator") return null;

  if (checkingCommunity) {
    return <PageLoader />;
  }

  if (!hasCommunity) {
    return (
      <div className="w-full rounded-2xl border border-line bg-surface p-6 shadow-card">
        <h1 className="text-xl font-bold text-ink">{dict.creatorDash.addCourseTitle}</h1>
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const schema = courseCreateFormSchema({
      required: dict.changePassword.requiredError,
      positive: dict.validation.positiveNumber,
      percentRange: dict.validation.percentRange,
      invalidUrl: dict.validation.invalidUrl
    });
    const parsed = schema.safeParse({
      titleEn,
      titleAr,
      categoryId,
      isFree,
      price,
      discountPercentage,
      introVideoUrl
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
          titleEn,
          titleAr,
          descriptionEn: descriptionEn.trim() || undefined,
          descriptionAr: descriptionAr.trim() || undefined,
          image: image ?? undefined,
          price: isFree ? undefined : price,
          discountPercentage: isFree ? undefined : discountPercentage,
          introVideoUrl: introVideoUrl || undefined,
          isFree
        },
        locale
      );
      router.push(`/${locale}/creator/courses/${created.id}/edit`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : dict.creatorDash.courseError);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="w-full space-y-5 rounded-2xl border border-line bg-surface p-6 shadow-card">
      <h1 className="text-xl font-bold text-ink">{dict.creatorDash.addCourseTitle}</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={dict.creatorDash.fieldTitleEn} error={fieldErrors.titleEn}>
          <input
            dir="ltr"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            className={fieldInputClass(!!fieldErrors.titleEn)}
          />
        </FormField>
        <FormField label={dict.creatorDash.fieldTitleAr} error={fieldErrors.titleAr}>
          <input
            dir="rtl"
            value={titleAr}
            onChange={(e) => setTitleAr(e.target.value)}
            className={fieldInputClass(!!fieldErrors.titleAr)}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={dict.creatorDash.fieldDescEn}>
          <textarea
            dir="ltr"
            rows={3}
            value={descriptionEn}
            onChange={(e) => setDescriptionEn(e.target.value)}
            className={`${fieldInputClass()} resize-none`}
          />
        </FormField>
        <FormField label={dict.creatorDash.fieldDescAr}>
          <textarea
            dir="rtl"
            rows={3}
            value={descriptionAr}
            onChange={(e) => setDescriptionAr(e.target.value)}
            className={`${fieldInputClass()} resize-none`}
          />
        </FormField>
      </div>

      <FormField label={dict.creatorDash.fieldCategory} error={fieldErrors.categoryId}>
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
        <span className="mb-1.5 block text-xs font-medium text-ink/65">{dict.creatorDash.fieldCourseImage}</span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          className="w-full text-sm text-ink/70"
        />
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
          <FormField label={dict.creatorDash.fieldPrice} error={fieldErrors.price}>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value) || 0)}
              className={fieldInputClass(!!fieldErrors.price)}
            />
          </FormField>
          <FormField label={dict.creatorDash.fieldCourseDiscount} error={fieldErrors.discountPercentage}>
            <input
              type="number"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(Number(e.target.value) || 0)}
              className={fieldInputClass(!!fieldErrors.discountPercentage)}
            />
          </FormField>
        </div>
      )}

      <FormField label={dict.creatorDash.fieldIntroUrl} error={fieldErrors.introVideoUrl}>
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
    </form>
  );
}
