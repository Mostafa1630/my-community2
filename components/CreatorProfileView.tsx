"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Pencil } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import DashboardPageHeader from "./DashboardPageHeader";

export default function CreatorProfileView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { user, updateProfile } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bioEn, setBioEn] = useState("");
  const [bioAr, setBioAr] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && user.role === "creator") {
      setName(user.name);
      setPhoneNumber(user.phoneNumber ?? "");
      setBioEn(user.bioEn);
      setBioAr(user.bioAr);
    }
  }, [user]);

  if (!user || user.role !== "creator") return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await updateProfile(
        {
          name,
          phoneNumber,
          bioEn,
          bioAr,
          image: avatarFile ?? undefined,
          coverImage: coverFile ?? undefined
        },
        locale
      );
      setAvatarFile(null);
      setCoverFile(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : dict.changePassword.genericError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <DashboardPageHeader title={dict.creatorDash.profile} subtitle={dict.creatorDash.profileSubtitle} />

      <div className="mb-6 overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        <div className="relative">
          <img
            src={coverPreview || user.coverImage || "/images/cover-placeholder.jpg"}
            alt=""
            className="h-24 w-full object-cover"
          />
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="absolute end-3 top-3 rounded-full bg-ink/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-ink/75"
          >
            {dict.common.changeCover}
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setCoverFile(file);
              setCoverPreview(file ? URL.createObjectURL(file) : null);
            }}
          />
        </div>
        <div className="flex items-end gap-3 px-5 pb-5">
          <img
            src={avatarPreview || user.profileImage || "/images/avatar-placeholder.jpg"}
            alt={user.name}
            className="-mt-8 h-16 w-16 rounded-full border-4 border-surface object-cover"
          />
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            className="link-underline flex items-center gap-1 text-sm font-semibold text-primary-700"
          >
            {dict.common.changePhoto}
            <Pencil size={12} />
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setAvatarFile(file);
              setAvatarPreview(file ? URL.createObjectURL(file) : null);
            }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-line bg-surface p-6 shadow-card">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-ink/65">{dict.common.name}</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-ink/65">{dict.common.phoneNumber}</span>
            <input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+20 100 000 0000"
              className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-ink/65">{locale === "ar" ? "السيرة الذاتية (إنجليزي)" : "Bio (English)"}</span>
            <textarea
              rows={4}
              value={bioEn}
              onChange={(e) => setBioEn(e.target.value)}
              className="w-full resize-none rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-ink/65">{locale === "ar" ? "السيرة الذاتية (عربي)" : "Bio (Arabic)"}</span>
            <textarea
              dir="rtl"
              rows={4}
              value={bioAr}
              onChange={(e) => setBioAr(e.target.value)}
              className="w-full resize-none rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
            />
          </label>
        </div>

        {error && (
          <p className="flex items-start gap-2 rounded-xl bg-danger/10 px-3 py-2.5 text-xs text-danger">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-60"
          >
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
