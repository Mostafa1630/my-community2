"use client";

import { useEffect, useState } from "react";
import { AlertCircle, BookX, Loader2, Pencil, Plus, Trash2, Video } from "lucide-react";
import { t } from "@/lib/i18n/t";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { lessonFormSchema, collectIssues } from "@/lib/validation/creatorForms";
import EmptyState from "./EmptyState";
import Modal from "./motion/Modal";
import FormField, { fieldInputClass } from "./FormField";
import PageLoader from "./PageLoader";

interface LessonRow {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  url: string;
  isFree: boolean;
  order?: number;
  status: string;
}

interface LessonFormState {
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  videoUrl: string;
  duration: string;
  order: string;
  isFree: boolean;
  status: "active" | "inactive";
}

const emptyForm: LessonFormState = {
  titleEn: "",
  titleAr: "",
  descriptionEn: "",
  descriptionAr: "",
  videoUrl: "",
  duration: "",
  order: "",
  isFree: false,
  status: "active"
};

// GET /creators/courses/{id}/lessons (round 12) replaced reusing the
// lessons array embedded in the public GET /courses/details/{id} (round
// 11's workaround). Fetched twice in parallel (locale "en"/"ar") to build
// bilingual rows, same as every other creator-dashboard list in this app.
// `duration` is still write-only — no GET anywhere on this backend ever
// returns it (not the list, not the single-lesson GET, not the create
// response) — so it's never prefilled, only sent if the creator types one.
export default function LessonsManagerView({
  courseId,
  locale,
  dict
}: {
  courseId: string;
  locale: Locale;
  dict: Dictionary;
}) {
  const { user, getCourseByCreator, getLessonsByCourse, getLessonByCreator, createLesson, updateLessonByCreator, deleteLessonByCreator } =
    useAuth();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");
  const [lessons, setLessons] = useState<LessonRow[]>([]);

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<LessonFormState>(emptyForm);
  const [modalLoading, setModalLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function load() {
    if (!user || user.role !== "creator") {
      setLoading(false);
      return;
    }
    const course = await getCourseByCreator(courseId, locale);
    if (!course) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setCourseTitle(course.title);
    const [enLessons, arLessons] = await Promise.all([
      getLessonsByCourse(courseId, "en"),
      getLessonsByCourse(courseId, "ar")
    ]);
    const merged: LessonRow[] = enLessons
      .map((en) => {
        const ar = arLessons.find((l) => l.id === en.id);
        return {
          id: en.id,
          titleEn: en.title,
          titleAr: ar?.title ?? en.title,
          descriptionEn: en.description,
          descriptionAr: ar?.description ?? en.description,
          url: en.videoUrl,
          isFree: en.isFree,
          order: en.order,
          status: en.status
        };
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    setLessons(merged);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, courseId, locale]);

  if (!user || user.role !== "creator") return null;

  if (loading) {
    return <PageLoader />;
  }

  if (notFound) {
    return <EmptyState icon={BookX} title={dict.creatorDash.courseNotFound} />;
  }

  function openCreate() {
    setForm(emptyForm);
    setFieldErrors({});
    setFormError("");
    setModalMode("create");
  }

  async function openEdit(lesson: LessonRow) {
    setModalMode("edit");
    setEditingId(lesson.id);
    setFieldErrors({});
    setFormError("");
    setModalLoading(true);
    const [en, ar] = await Promise.all([getLessonByCreator(lesson.id, "en"), getLessonByCreator(lesson.id, "ar")]);
    setForm({
      titleEn: en?.title ?? lesson.titleEn,
      titleAr: ar?.title ?? lesson.titleAr,
      descriptionEn: en?.description ?? lesson.descriptionEn,
      descriptionAr: ar?.description ?? lesson.descriptionAr,
      videoUrl: en?.videoUrl ?? lesson.url,
      duration: "",
      order: String(lesson.order ?? ""),
      isFree: en?.isFree ?? lesson.isFree,
      status: (en?.status ?? lesson.status) === "inactive" ? "inactive" : "active"
    });
    setModalLoading(false);
  }

  function closeModal() {
    setModalMode(null);
    setEditingId(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const schema = lessonFormSchema({
      required: dict.changePassword.requiredError,
      positive: dict.validation.positiveNumber,
      invalidUrl: dict.validation.invalidUrl
    });
    const parsed = schema.safeParse({
      titleEn: form.titleEn,
      titleAr: form.titleAr,
      videoUrl: form.videoUrl,
      duration: form.duration ? Number(form.duration) : undefined,
      order: form.order ? Number(form.order) : undefined
    });
    if (!parsed.success) {
      setFieldErrors(collectIssues(parsed.error.issues));
      return;
    }
    setFieldErrors({});
    setFormError("");
    setSaving(true);
    try {
      if (modalMode === "create") {
        await createLesson(
          courseId,
          {
            titleEn: form.titleEn,
            titleAr: form.titleAr,
            descriptionEn: form.descriptionEn || undefined,
            descriptionAr: form.descriptionAr || undefined,
            videoUrl: form.videoUrl,
            duration: parsed.data.duration,
            order: parsed.data.order,
            isFree: form.isFree
          },
          locale
        );
      } else if (editingId) {
        await updateLessonByCreator(
          editingId,
          {
            titleEn: form.titleEn,
            titleAr: form.titleAr,
            descriptionEn: form.descriptionEn,
            descriptionAr: form.descriptionAr,
            videoUrl: form.videoUrl,
            duration: parsed.data.duration,
            order: parsed.data.order,
            isFree: form.isFree,
            status: form.status
          },
          locale
        );
      }
      closeModal();
      setLoading(true);
      await load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : dict.creatorDash.lessonError);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirmId) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteLessonByCreator(confirmId, locale);
      setLessons((prev) => prev.filter((l) => l.id !== confirmId));
      setConfirmId(null);
    } catch {
      setDeleteError(dict.creatorDash.lessonDeleteError);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">{t(dict.creatorDash.lessonsOf, { title: courseTitle })}</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-full bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
        >
          <Plus size={16} />
          {dict.creatorDash.addLesson}
        </button>
      </div>

      {lessons.length === 0 ? (
        <EmptyState icon={Video} title={dict.common.empty} />
      ) : (
        <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
          {lessons.map((lesson, i) => (
            <div key={lesson.id} className="flex items-center gap-3 px-4 py-3.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 font-mono text-xs font-semibold text-primary-700">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">
                  {locale === "ar" ? lesson.titleAr : lesson.titleEn}
                </p>
                <p className="truncate text-xs text-ink/65">{lesson.url}</p>
              </div>
              {lesson.status === "inactive" && (
                <span className="shrink-0 rounded-full bg-accent-50 px-2 py-0.5 text-[11px] font-medium text-accent-700">
                  {dict.common.inactive}
                </span>
              )}
              <button
                onClick={() => openEdit(lesson)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/65 hover:bg-primary-50 hover:text-primary-700"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => setConfirmId(lesson.id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/65 hover:bg-danger/10 hover:text-danger"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!modalMode} onClose={closeModal} maxWidth="max-w-lg" panelClassName="max-h-[90vh] space-y-4 overflow-y-auto">
        {modalLoading ? (
          <div className="flex items-center gap-2 py-6 text-sm text-ink/65">
            <Loader2 size={16} className="animate-spin" />
            {dict.creatorDash.lessonsLoading}
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <h3 className="text-base font-bold text-ink">
              {modalMode === "create" ? dict.creatorDash.addLesson : dict.creatorDash.editLesson}
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label={dict.creatorDash.fieldLessonTitleEn} error={fieldErrors.titleEn}>
                <input
                  value={form.titleEn}
                  onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                  className={fieldInputClass(!!fieldErrors.titleEn)}
                />
              </FormField>
              <FormField label={dict.creatorDash.fieldLessonTitleAr} error={fieldErrors.titleAr}>
                <input
                  dir="rtl"
                  value={form.titleAr}
                  onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                  className={fieldInputClass(!!fieldErrors.titleAr)}
                />
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label={dict.creatorDash.fieldLessonDescEn}>
                <textarea
                  rows={2}
                  value={form.descriptionEn}
                  onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                  className={`${fieldInputClass()} resize-none`}
                />
              </FormField>
              <FormField label={dict.creatorDash.fieldLessonDescAr}>
                <textarea
                  dir="rtl"
                  rows={2}
                  value={form.descriptionAr}
                  onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                  className={`${fieldInputClass()} resize-none`}
                />
              </FormField>
            </div>

            <FormField label={dict.creatorDash.fieldYoutubeUrl} error={fieldErrors.videoUrl}>
              <input
                dir="ltr"
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                className={fieldInputClass(!!fieldErrors.videoUrl)}
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label={dict.creatorDash.fieldLessonDuration} error={fieldErrors.duration}>
                <input
                  type="number"
                  min={1}
                  placeholder="—"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className={fieldInputClass(!!fieldErrors.duration)}
                />
              </FormField>
              <FormField label={dict.creatorDash.fieldOrder} error={fieldErrors.order}>
                <input
                  type="number"
                  min={1}
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: e.target.value })}
                  className={fieldInputClass(!!fieldErrors.order)}
                />
              </FormField>
            </div>

            <div className="flex flex-wrap items-center gap-5">
              <label className="flex items-center gap-2 text-sm text-ink/70">
                <input
                  type="checkbox"
                  checked={form.isFree}
                  onChange={(e) => setForm({ ...form, isFree: e.target.checked })}
                  className="h-4 w-4 rounded border-line"
                />
                {dict.creatorDash.fieldLessonFree}
              </label>

              {modalMode === "edit" && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-ink/65">{dict.common.status}</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, status: "active" })}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                        form.status === "active" ? "border-success bg-success/10 text-success" : "border-line text-ink/65"
                      }`}
                    >
                      {dict.common.active}
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, status: "inactive" })}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                        form.status === "inactive" ? "border-accent-500 bg-accent-50 text-accent-700" : "border-line text-ink/65"
                      }`}
                    >
                      {dict.common.inactive}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {formError && (
              <p className="flex items-center gap-1.5 text-sm font-medium text-danger">
                <AlertCircle size={14} />
                {formError}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-line px-4 py-2.5 text-sm font-medium text-ink/70"
              >
                {dict.common.cancel}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 rounded-full bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {modalMode === "create" ? dict.creatorDash.lessonCreateButton : dict.common.save}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        open={!!confirmId}
        onClose={() => {
          setConfirmId(null);
          setDeleteError("");
        }}
      >
        <h3 className="text-base font-bold text-ink">{dict.common.delete}?</h3>
        {deleteError && <p className="mt-2 text-sm font-medium text-danger">{deleteError}</p>}
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => {
              setConfirmId(null);
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
