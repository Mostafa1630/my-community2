"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, UserRound } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import EmptyState from "./EmptyState";
import ChangePasswordForm from "./ChangePasswordForm";

export default function StudentProfileView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { user, role, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhoneNumber(user.phoneNumber ?? "");
    }
  }, [user]);

  if (role !== "student" || !user) {
    return <EmptyState icon={UserRound} title={dict.common.empty} />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await updateProfile({ name, email, phoneNumber, image: avatarFile ?? undefined }, locale);
      setAvatarFile(null);
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
      <div className="mb-6 flex items-center gap-4">
        <img
          src={avatarPreview || user.profileImage || "/images/avatar-placeholder.jpg"}
          alt={user.name}
          className="h-16 w-16 rounded-full border border-line object-cover"
        />
        <div>
          <p className="text-sm font-medium text-ink/60">{name || user.name}</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="link-underline text-xs font-medium text-primary-700"
          >
            {dict.common.changePhoto}
          </button>
          <input
            ref={fileInputRef}
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
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink/60">{dict.common.name}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink/60">{dict.common.email}</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink/60">{dict.common.phoneNumber}</label>
          <input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+20 100 000 0000"
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
          />
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
            className="rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:opacity-60"
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

      <div className="mt-6">
        <ChangePasswordForm locale={locale} dict={dict} />
      </div>
    </div>
  );
}
