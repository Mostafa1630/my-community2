"use client";

import Link from "next/link";
import { Mail, Pencil, Phone, User, UserRound } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import DashboardPageHeader from "./DashboardPageHeader";
import EmptyState from "./EmptyState";
import PageLoader from "./PageLoader";
import ProfileInfoField from "./ProfileInfoField";

export default function StudentProfileDisplayView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { user, role, hydrated } = useAuth();

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

        <div className="grid gap-3 px-6 pb-6 sm:grid-cols-3 sm:px-8 sm:pb-8">
          <ProfileInfoField label={dict.common.name} value={user.name} icon={User} />
          <ProfileInfoField label={dict.common.email} value={user.email} icon={Mail} dir="ltr" />
          <ProfileInfoField
            label={dict.common.phoneNumber}
            value={user.phoneNumber || ""}
            icon={Phone}
            dir="ltr"
          />
        </div>
      </div>
    </div>
  );
}
