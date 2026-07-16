"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Course, AccentKey, Category } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { accentMap, getAccent } from "@/lib/accents";

const ACCENTS = Object.keys(accentMap) as AccentKey[];

export default function CourseForm({
  mode,
  initial,
  categories,
  locale,
  dict,
  onSave,
  cancelHref
}: {
  mode: "new" | "edit";
  initial?: Course;
  categories: Category[];
  locale: Locale;
  dict: Dictionary;
  onSave: (
    data: Omit<
      Course,
      | "id"
      | "slug"
      | "creatorId"
      | "communityId"
      | "lessons"
      | "studentsCount"
      | "ratingAverage"
      | "discountPercentage"
      | "createdAt"
      | "updatedAt"
    >
  ) => void;
  cancelHref: string;
}) {
  const router = useRouter();
  const [titleEn, setTitleEn] = useState(initial?.titleEn ?? "");
  const [titleAr, setTitleAr] = useState(initial?.titleAr ?? "");
  const [descEn, setDescEn] = useState(initial?.descEn ?? "");
  const [descAr, setDescAr] = useState(initial?.descAr ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [price, setPrice] = useState(initial?.price ?? 500);
  const [introVideoUrl, setIntroVideoUrl] = useState(initial?.introVideoUrl ?? "");
  const [accent, setAccent] = useState<AccentKey>(initial?.accent ?? "teal");
  const [status, setStatus] = useState<Course["status"]>(initial?.status ?? "draft");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ titleEn, titleAr, descEn, descAr, categoryId, price, introVideoUrl, accent, status });
    router.push(cancelHref);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5 rounded-2xl border border-line bg-surface p-6 shadow-card">
      <h1 className="text-xl font-bold text-ink">
        {mode === "new" ? dict.creatorDash.addCourseTitle : dict.creatorDash.editCourseTitle}
      </h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label={dict.creatorDash.fieldTitleEn} value={titleEn} onChange={setTitleEn} dir="ltr" />
        <TextField label={dict.creatorDash.fieldTitleAr} value={titleAr} onChange={setTitleAr} dir="rtl" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextArea label={dict.creatorDash.fieldDescEn} value={descEn} onChange={setDescEn} dir="ltr" />
        <TextArea label={dict.creatorDash.fieldDescAr} value={descAr} onChange={setDescAr} dir="rtl" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink/60">{dict.creatorDash.fieldCategory}</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {locale === "ar" ? c.nameAr : c.nameEn}
              </option>
            ))}
          </select>
        </div>
        <TextField
          label={dict.creatorDash.fieldPrice}
          value={String(price)}
          onChange={(v) => setPrice(Number(v) || 0)}
          type="number"
        />
      </div>

      <TextField label={dict.creatorDash.fieldIntroUrl} value={introVideoUrl} onChange={setIntroVideoUrl} dir="ltr" />

      <div>
        <label className="mb-1.5 block text-xs font-medium text-ink/60">{dict.creatorDash.fieldThumbnail}</label>
        <div className="flex gap-1.5">
          {ACCENTS.map((a) => (
            <button
              type="button"
              key={a}
              onClick={() => setAccent(a)}
              className={`h-8 w-8 rounded-full bg-gradient-to-br ${getAccent(a).gradient} ${
                accent === a ? "ring-2 ring-offset-2 ring-primary-400" : ""
              }`}
              aria-label={a}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-ink/60">{dict.common.status}</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setStatus("draft")}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium ${
              status === "draft" ? "border-accent-500 bg-accent-50 text-accent-700" : "border-line text-ink/60"
            }`}
          >
            {dict.common.draft}
          </button>
          <button
            type="button"
            onClick={() => setStatus("published")}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium ${
              status === "published" ? "border-success bg-success/10 text-success" : "border-line text-ink/60"
            }`}
          >
            {dict.common.published}
          </button>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={() => router.push(cancelHref)}
          className="flex-1 rounded-full border border-line py-2.5 text-sm font-medium text-ink/70 sm:flex-none sm:px-6"
        >
          {dict.common.cancel}
        </button>
        <button
          type="submit"
          className="flex-1 rounded-full bg-primary-500 py-2.5 text-sm font-semibold text-white sm:flex-none sm:px-6"
        >
          {dict.common.save}
        </button>
      </div>
    </form>
  );
}

function TextField({
  label,
  value,
  onChange,
  dir,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  dir?: "ltr" | "rtl";
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink/60">{label}</label>
      <input
        type={type}
        dir={dir}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  dir
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink/60">{label}</label>
      <textarea
        dir={dir}
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-none rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
      />
    </div>
  );
}
