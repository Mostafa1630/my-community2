"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, Pencil, Phone, User } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import DashboardPageHeader from "./DashboardPageHeader";
import ProfileInfoField from "./ProfileInfoField";

export default function CreatorProfileDisplayView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { user } = useAuth();
  const [coverFailed, setCoverFailed] = useState(false);

  if (!user || user.role !== "creator") return null;

  return (
    <div className="w-full">
      <DashboardPageHeader
        title={dict.creatorDash.profile}
        subtitle={dict.creatorDash.profileSubtitle}
        action={
          <Link
            href={`/${locale}/creator/profile/edit`}
            className="flex items-center gap-1.5 rounded-full bg-accent-500 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-accent-400"
          >
            <Pencil size={16} />
            {dict.creatorDash.profileEditCta}
          </Link>
        }
      />

      <div className="rounded-2xl border border-line bg-surface shadow-card">
        <div className="relative h-48 overflow-hidden rounded-t-2xl sm:h-64">
          {user.coverImage && !coverFailed ? (
            <img
              src={user.coverImage}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setCoverFailed(true)}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700" />
          )}
        </div>

        <div className="flex items-end gap-4 px-5 pb-6 sm:px-8">
          <div className="relative -mt-14 sm:-mt-16">
            <img
              src={user.profileImage || "/images/avatar-placeholder.jpg"}
              alt={user.name}
              className="h-28 w-28 rounded-full border-4 border-surface object-cover shadow-raised sm:h-32 sm:w-32"
            />
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-ink">{user.name}</h2>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ProfileInfoField label={dict.common.name} value={user.name} icon={User} />
            <ProfileInfoField label={dict.common.email} value={user.email} icon={Mail} dir="ltr" />
            <ProfileInfoField
              label={dict.common.phoneNumber}
              value={user.phoneNumber || ""}
              icon={Phone}
              dir="ltr"
            />
          </div>

          {user.bioEn && (
            <div className="mt-3 rounded-lg border border-line bg-paper px-3 py-2.5">
              <p className="mb-1 text-[11px] font-medium text-ink/55">{dict.creatorDash.fieldBio}</p>
              <p className="text-sm leading-6 text-ink/80">{user.bioEn}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
