"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import { usePlatformStore } from "@/lib/platform-store";
import type { Creator } from "@/lib/types";
import DashboardPageHeader from "./DashboardPageHeader";

export default function CreatorProfileView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { user } = useAuth();
  const store = usePlatformStore();
  const [name, setName] = useState("");
  const [bioEn, setBioEn] = useState("");
  const [bioAr, setBioAr] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user && user.role === "creator") {
      setName(user.name);
      setBioEn(user.bioEn);
      setBioAr(user.bioAr);
    }
  }, [user]);

  if (!user || user.role !== "creator") return null;

  return (
    <div className="w-full">
      <DashboardPageHeader title={dict.creatorDash.profile} subtitle={dict.creatorDash.profileSubtitle} />

      <div className="mb-6 overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        <img
          src={user.coverImage || "/images/cover-placeholder.jpg"}
          alt=""
          className="h-24 w-full object-cover"
        />
        <div className="flex items-end gap-3 px-5 pb-5">
          <img
            src={user.profileImage || "/images/avatar-placeholder.jpg"}
            alt={user.name}
            className="-mt-8 h-16 w-16 rounded-full border-4 border-surface object-cover"
          />
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          store.users.update(user.id, { name, bioEn, bioAr } satisfies Partial<Creator>);
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        }}
        className="space-y-4 rounded-2xl border border-line bg-surface p-6 shadow-card"
      >
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink/60">{dict.common.name}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink/60">{locale === "ar" ? "السيرة الذاتية (إنجليزي)" : "Bio (English)"}</label>
            <textarea
              rows={4}
              value={bioEn}
              onChange={(e) => setBioEn(e.target.value)}
              className="w-full resize-none rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink/60">{locale === "ar" ? "السيرة الذاتية (عربي)" : "Bio (Arabic)"}</label>
            <textarea
              dir="rtl"
              rows={4}
              value={bioAr}
              onChange={(e) => setBioAr(e.target.value)}
              className="w-full resize-none rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-600">
            {dict.common.save}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-success">
              <CheckCircle2 size={14} />
              {locale === "ar" ? "تم الحفظ" : "Saved"}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
