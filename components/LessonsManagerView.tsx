"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Video, BookX } from "lucide-react";
import type { Lesson } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { t } from "@/lib/i18n/t";
import { useAuth } from "@/lib/auth-context";
import { usePlatformStore } from "@/lib/platform-store";
import EmptyState from "./EmptyState";

const emptyLesson = {
  titleEn: "",
  titleAr: "",
  descEn: "",
  descAr: "",
  youtubeUrl: "",
  durationMinutes: 15,
  isFree: false
};

export default function LessonsManagerView({
  courseId,
  locale,
  dict
}: {
  courseId: string;
  locale: Locale;
  dict: Dictionary;
}) {
  const { user } = useAuth();
  const store = usePlatformStore();
  const { addLesson, updateLesson, deleteLesson } = store;
  const course = store.courses.all.find((c) => c.id === courseId);
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyLesson);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (!user || user.role !== "creator") return null;
  if (!course || course.creatorId !== user.id) {
    return <EmptyState icon={BookX} title={dict.common.empty} />;
  }

  const title = locale === "ar" ? course.titleAr : course.titleEn;

  function openCreate() {
    setForm(emptyLesson);
    setCreating(true);
  }

  function openEdit(lesson: Lesson) {
    setForm({
      titleEn: lesson.titleEn,
      titleAr: lesson.titleAr,
      descEn: lesson.descEn,
      descAr: lesson.descAr,
      youtubeUrl: lesson.youtubeUrl,
      durationMinutes: lesson.durationMinutes,
      isFree: lesson.isFree
    });
    setEditing(lesson);
  }

  function closeModal() {
    setCreating(false);
    setEditing(null);
  }

  function submit() {
    if (!course) return;
    if (creating) {
      addLesson(courseId, {
        id: `lesson-local-${Date.now()}`,
        courseId,
        order: course.lessons.length + 1,
        ...form
      });
    } else if (editing) {
      updateLesson(courseId, editing.id, form);
    }
    closeModal();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">{t(dict.creatorDash.lessonsOf, { title })}</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-full bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
        >
          <Plus size={16} />
          {dict.creatorDash.addLesson}
        </button>
      </div>

      {course.lessons.length === 0 ? (
        <EmptyState icon={Video} title={dict.common.empty} />
      ) : (
        <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
          {course.lessons.map((lesson, i) => (
            <div key={lesson.id} className="flex items-center gap-3 px-4 py-3.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 font-mono text-xs font-semibold text-primary-700">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">
                  {locale === "ar" ? lesson.titleAr : lesson.titleEn}
                </p>
                <p className="truncate text-xs text-ink/45">{lesson.youtubeUrl}</p>
              </div>
              <span className="shrink-0 font-mono text-xs text-ink/40">{lesson.durationMinutes}m</span>
              <button
                onClick={() => openEdit(lesson)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/50 hover:bg-primary-50 hover:text-primary-700"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => setConfirmId(lesson.id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/50 hover:bg-danger/10 hover:text-danger"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg space-y-4 rounded-2xl bg-surface p-6 shadow-raised">
            <h3 className="text-base font-bold text-ink">
              {creating ? dict.creatorDash.addLesson : dict.creatorDash.editLesson}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={dict.creatorDash.fieldLessonTitleEn} value={form.titleEn} onChange={(v) => setForm({ ...form, titleEn: v })} />
              <Field label={dict.creatorDash.fieldLessonTitleAr} value={form.titleAr} onChange={(v) => setForm({ ...form, titleAr: v })} dir="rtl" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={dict.creatorDash.fieldLessonDescEn} value={form.descEn} onChange={(v) => setForm({ ...form, descEn: v })} />
              <Field label={dict.creatorDash.fieldLessonDescAr} value={form.descAr} onChange={(v) => setForm({ ...form, descAr: v })} dir="rtl" />
            </div>
            <Field label={dict.creatorDash.fieldYoutubeUrl} value={form.youtubeUrl} onChange={(v) => setForm({ ...form, youtubeUrl: v })} />
            <Field
              label={locale === "ar" ? "مدة الدرس (دقائق)" : "Lesson duration (minutes)"}
              value={String(form.durationMinutes)}
              onChange={(v) => setForm({ ...form, durationMinutes: Number(v) || 0 })}
              type="number"
            />
            <label className="flex items-center gap-2 text-sm text-ink/70">
              <input
                type="checkbox"
                checked={form.isFree}
                onChange={(e) => setForm({ ...form, isFree: e.target.checked })}
                className="h-4 w-4 rounded border-line"
              />
              {dict.creatorDash.fieldLessonFree}
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={closeModal} className="rounded-full border border-line px-4 py-2.5 text-sm font-medium text-ink/70">
                {dict.common.cancel}
              </button>
              <button onClick={submit} className="rounded-full bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white">
                {dict.common.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-raised">
            <h3 className="text-base font-bold text-ink">{dict.common.delete}?</h3>
            <div className="mt-6 flex gap-2">
              <button onClick={() => setConfirmId(null)} className="flex-1 rounded-full border border-line py-2.5 text-sm font-medium text-ink/70">
                {dict.common.cancel}
              </button>
              <button
                onClick={() => {
                  deleteLesson(courseId, confirmId);
                  setConfirmId(null);
                }}
                className="flex-1 rounded-full bg-danger py-2.5 text-sm font-semibold text-white"
              >
                {dict.common.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
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
