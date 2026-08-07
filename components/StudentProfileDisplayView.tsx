"use client";

import Link from "next/link";
import { Mail, Pencil, Phone, User, UserRound } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import DashboardPageHeader from "./DashboardPageHeader";
import EmptyState from "./EmptyState";
import PageLoader from "./PageLoader";

// Read-only display of the student's own profile — same list/display+edit
// split as My Community and the creator profile: this page just shows the
// data, an "Edit" button in the header takes you to the actual form
// (StudentProfileView, mounted at /profile/edit), and saving there
// navigates back here.
export default function StudentProfileDisplayView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { user, role, hydrated } = useAuth();

  // Same reasoning as the review form / subscribe card fixes — deciding
  // "not a student" off `role` before the real session is confirmed showed
  // a genuinely logged-in student an empty/wrong page on load.
  if (!hydrated) return <PageLoader />;

  if (role !== "student" || !user) {
    return <EmptyState icon={UserRound} title={dict.common.empty} />;
  }

  return (
    <div className="w-full">
      <DashboardPageHeader
        title={dict.student.profileTitle}
        subtitle={dict.student.profileSubtitle}
        action={
          <Link
            href={`/${locale}/profile/edit`}
            className="flex items-center gap-1.5 rounded-full bg-accent-500 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-accent-400"
          >
            <Pencil size={16} />
            {dict.student.profileEditCta}
          </Link>
        }
      />

      <div className="rounded-2xl border border-line bg-surface shadow-card">
        <div className="flex items-center gap-4 p-6 sm:p-8">
          <img
            src={user.profileImage || "/images/avatar-placeholder.jpg"}
            alt={user.name}
            className="h-16 w-16 shrink-0 rounded-full border border-line object-cover"
          />
          <h2 className="text-xl font-bold tracking-tight text-ink">{user.name}</h2>
        </div>

        <div className="grid gap-4 px-6 pb-6 sm:grid-cols-3 sm:px-8 sm:pb-8">
          <div className="rounded-xl border border-line bg-paper p-4 sm:p-5">
            <p className="mb-2 text-xs font-medium tracking-wide text-ink/55">{dict.common.name}</p>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
              <User size={13} className="shrink-0 text-primary-600" />
              {user.name}
            </p>
          </div>
          <div className="rounded-xl border border-line bg-paper p-4 sm:p-5">
            <p className="mb-2 text-xs font-medium tracking-wide text-ink/55">{dict.common.email}</p>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
              <Mail size={13} className="shrink-0 text-primary-600" />
              <span className="break-all">{user.email}</span>
            </p>
          </div>
          <div className="rounded-xl border border-line bg-paper p-4 sm:p-5">
            <p className="mb-2 text-xs font-medium tracking-wide text-ink/55">{dict.common.phoneNumber}</p>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
              <Phone size={13} className="shrink-0 text-primary-600" />
              {user.phoneNumber || "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
