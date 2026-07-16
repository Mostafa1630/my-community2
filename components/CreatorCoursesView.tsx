"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Pencil, Trash2, ListVideo } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import { usePlatformStore } from "@/lib/platform-store";
import { getCategoryById } from "@/lib/data";
import { formatPrice, formatNumber } from "@/lib/format";
import { Table, Thead, Th, Tr, Td } from "@/components/Table";
import Badge from "@/components/Badge";
import EmptyState from "@/components/EmptyState";
import DashboardPageHeader from "@/components/DashboardPageHeader";

export default function CreatorCoursesView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { user } = useAuth();
  const store = usePlatformStore();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (!user || user.role !== "creator") return null;
  const myCourses = store.courses.all.filter((c) => c.creatorId === user.id);
  const base = `/${locale}/creator`;

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

      {myCourses.length === 0 ? (
        <EmptyState icon={ListVideo} title={dict.common.empty} />
      ) : (
        <Table>
          <Thead>
            <Th>{dict.common.name}</Th>
            <Th>{dict.common.category}</Th>
            <Th>{dict.common.price}</Th>
            <Th>{dict.common.students}</Th>
            <Th>{dict.common.status}</Th>
            <Th>{dict.common.actions}</Th>
          </Thead>
          <tbody>
            {myCourses.map((course) => {
              const category = getCategoryById(course.categoryId);
              const title = locale === "ar" ? course.titleAr : course.titleEn;
              return (
                <Tr key={course.id}>
                  <Td className="max-w-[220px] truncate font-medium text-ink">{title}</Td>
                  <Td>{category ? (locale === "ar" ? category.nameAr : category.nameEn) : "—"}</Td>
                  <Td className="font-mono">{formatPrice(course.price, locale)}</Td>
                  <Td>{formatNumber(course.studentsCount, locale)}</Td>
                  <Td>
                    <Badge tone={course.status === "published" ? "success" : "pending"}>
                      {course.status === "published" ? dict.common.published : dict.common.draft}
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
              );
            })}
          </tbody>
        </Table>
      )}

      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-raised">
            <h3 className="text-base font-bold text-ink">{dict.common.delete}?</h3>
            <p className="mt-2 text-sm text-ink/60">
              {locale === "ar" ? "الإجراء ده مش هيترجع." : "This action cannot be undone."}
            </p>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setConfirmId(null)}
                className="flex-1 rounded-full border border-line py-2.5 text-sm font-medium text-ink/70"
              >
                {dict.common.cancel}
              </button>
              <button
                onClick={() => {
                  store.courses.remove(confirmId);
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
