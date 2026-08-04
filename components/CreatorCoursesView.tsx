"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ListVideo, Loader2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import { formatPrice } from "@/lib/format";
import { Table, Thead, Th, Tr, Td } from "@/components/Table";
import Badge from "@/components/Badge";
import EmptyState from "@/components/EmptyState";
import DashboardPageHeader from "@/components/DashboardPageHeader";
import Modal from "@/components/motion/Modal";

// GET /creators/courses (round 12) replaced the old
// getCreatorDetails+per-course-getCourseDetails N+1 workaround from round
// 10 — one request now, no more per-course fan-out. Still no category
// column: no endpoint anywhere (this one included) ever returns a course's
// category, and this list shape has no students-count either (that only
// ever came from the public GET /courses/details/{id}, dropped here since
// it's not worth an extra fetch per row just for one column).
export default function CreatorCoursesView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { user, getMyCourses, deleteCourseByCreator } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<{ id: string; title: string; price: number; isFree: boolean; status: string }[]>(
    []
  );
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user || user.role !== "creator") {
        setLoading(false);
        return;
      }
      const myCourses = await getMyCourses(locale);
      if (!cancelled) {
        setCourses(myCourses);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, locale]);

  if (!user || user.role !== "creator") return null;

  const base = `/${locale}/creator`;

  async function handleDelete() {
    if (!confirmId) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteCourseByCreator(confirmId, locale);
      setCourses((prev) => prev.filter((c) => c.id !== confirmId));
      setConfirmId(null);
    } catch {
      setDeleteError(dict.creatorDash.courseDeleteError);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <DashboardPageHeader
        title={dict.creatorDash.coursesTableTitle}
        action={
          <Link
            href={`${base}/courses/new`}
            className="flex items-center gap-1.5 rounded-full bg-accent-500 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-accent-400"
          >
            <Plus size={16} />
            {dict.creatorDash.newCourse}
          </Link>
        }
      />

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-ink/50">
          <Loader2 size={16} className="animate-spin" />
          {dict.creatorDash.coursesLoading}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState icon={ListVideo} title={dict.common.empty} />
      ) : (
        <Table>
          <Thead>
            <Th>{dict.common.name}</Th>
            <Th>{dict.common.price}</Th>
            <Th>{dict.common.status}</Th>
            <Th>{dict.common.actions}</Th>
          </Thead>
          <tbody>
            {courses.map((course) => (
              <Tr key={course.id}>
                <Td className="max-w-[220px] truncate font-medium text-ink">{course.title}</Td>
                <Td className="font-mono">{course.isFree ? dict.common.free : formatPrice(course.price, locale)}</Td>
                <Td>
                  <Badge tone={course.status === "published" ? "success" : "pending"}>
                    {course.status === "published"
                      ? dict.common.published
                      : course.status === "pending"
                        ? dict.common.pending
                        : course.status || dict.common.draft}
                  </Badge>
                </Td>
                <Td>
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`${base}/courses/${course.id}/lessons`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/50 hover:bg-primary-50 hover:text-primary-700"
                      title={dict.creatorDash.lessons}
                    >
                      <ListVideo size={15} />
                    </Link>
                    <Link
                      href={`${base}/courses/${course.id}/edit`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/50 hover:bg-primary-50 hover:text-primary-700"
                      title={dict.common.edit}
                    >
                      <Pencil size={15} />
                    </Link>
                    <button
                      onClick={() => setConfirmId(course.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/50 hover:bg-danger/10 hover:text-danger"
                      title={dict.common.delete}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal
        open={!!confirmId}
        onClose={() => {
          setConfirmId(null);
          setDeleteError("");
        }}
      >
        <h3 className="text-base font-bold text-ink">{dict.common.delete}?</h3>
        <p className="mt-2 text-sm text-ink/60">
          {locale === "ar" ? "الإجراء ده مش هيترجع." : "This action cannot be undone."}
        </p>
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
