"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, BookX, CheckCircle2, Loader2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { Category } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { courseFormSchema, collectIssues, apiFieldErrors } from "@/lib/validation/creatorForms";

const API_FIELD_MAP: Record<string, string> = {
  category_id: "categoryId",
  title: "title",
  description: "description",
  price: "price",
  discount_percentage: "discountPercentage",
  intro_video_url: "introVideoUrl",
  image: "image"
};
import EmptyState from "./EmptyState";
import FormField, { fieldInputClass } from "./FormField";
import PageLoader from "./PageLoader";

export default function EditCourseView({
  courseId,
  locale,
  dict,
  categories
}: {
  courseId: string;
  locale: Locale;
  dict: Dictionary;
  categories: Category[];
}) {
  const router = useRouter();
  const { user, getCourseByCreator, updateCourseByCreator } = useAuth();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [introVideoUrl, setIntroVideoUrl] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState<string | undefined>(undefined);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // GET /creators/courses/{id} (round 12) replaced the public
  // GET /courses/details/{id} used here before — creator-scoped, so the
  // backend itself enforces ownership (a course that isn't this creator's
  // own just 404s, no manual creator-id check needed anymore). Still no
  // category field anywhere in this shape, so unlike title/description it
  // truly can't be recovered; left unresolved (see courseCategoryNote)
  // rather than guessed, and only sent on save if the creator actively
  // picks something other than the "leave unchanged" placeholder.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user || user.role !== "creator") {
        setLoading(false);
        return;
      }
      const details = await getCourseByCreator(courseId, locale);
      if (cancelled) return;
      if (!details) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setTitle(details.title);
      setDescription(details.description);
      setPrice(details.price);
      setDiscountPercentage(details.discountPercentage);
      setIntroVideoUrl(details.introVideo ?? "");
      setIsFree(details.isFree);
      setCurrentImage(details.image);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, courseId, locale]);

  if (!user || user.role !== "creator") return null;

  if (loading) {
    return <PageLoader />;
  }

  if (notFound) {
    return <EmptyState icon={BookX} title={dict.creatorDash.courseNotFound} />;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const schema = courseFormSchema({
      required: dict.changePassword.requiredError,
      positive: dict.validation.positiveNumber,
      percentRange: dict.validation.percentRange,
      invalidUrl: dict.validation.invalidUrl
    });
    const parsed = schema.safeParse({
      title,
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
      const result = await updateCourseByCreator(
        courseId,
        {
          categoryId: categoryId || undefined,
          title,
          description,
          image: image ?? undefined,
          price: isFree ? undefined : price,
          discountPercentage: isFree ? undefined : discountPercentage,
          introVideoUrl,
          isFree
        },
        locale
      );
      setCurrentImage(result.image);
      setImage(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors((prev) => ({ ...prev, ...apiFieldErrors(err.fieldErrors, API_FIELD_MAP) }));
        setError(err.message);
      } else {
        setError(dict.creatorDash.courseError);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="w-full space-y-5 rounded-2xl border border-line bg-surface p-6 shadow-card">
      <h1 className="text-xl font-bold text-ink">{dict.creatorDash.editCourseTitle}</h1>

      <FormField label={dict.creatorDash.fieldTitle} error={fieldErrors.title}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={fieldInputClass(!!fieldErrors.title)}
        />
      </FormField>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-ink/65">{dict.creatorDash.fieldDesc}</span>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full resize-none rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-ink/65">{dict.creatorDash.fieldCategory}</span>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className={fieldInputClass()}
        >
          <option value="">{dict.creatorDash.courseCategoryPlaceholder}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {locale === "ar" ? c.nameAr : c.nameEn}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-ink/65">{dict.creatorDash.courseCategoryNote}</p>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-ink/65">{dict.creatorDash.fieldCourseImage}</span>
        {currentImage && !image && <img src={currentImage} alt="" className="mb-2 h-28 w-full rounded-xl object-cover" />}
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
          {dict.common.save}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-success">
            <CheckCircle2 size={14} />
            {dict.creatorDash.courseSaved}
          </span>
        )}
      </div>
    </form>
  );
}
