"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Pencil, UserRound } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import DashboardPageHeader from "./DashboardPageHeader";
import FormField, { fieldInputClass } from "./FormField";
import EmptyState from "./EmptyState";
import PageLoader from "./PageLoader";

// Edit-only form — the display-first view lives in StudentProfileDisplayView
// (rendered at /profile), same list/display+edit split used for My Community
// and the creator profile. On save this navigates back to that display page.
export default function StudentProfileView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const router = useRouter();
  const { user, role, hydrated, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhoneNumber(user.phoneNumber ?? "");
    }
  }, [user]);

  if (!hydrated) return <PageLoader />;

  if (role !== "student" || !user) {
    return <EmptyState icon={UserRound} title={dict.common.empty} />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await updateProfile({ name, email, phoneNumber, image: avatarFile ?? undefined }, locale);
      router.push(`/${locale}/profile`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : dict.changePassword.genericError);
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <DashboardPageHeader title={dict.student.profileEditCta} subtitle={dict.student.profileSubtitle} />

      <div className="mb-6 flex items-center gap-4">
        <img
          src={avatarPreview || user.profileImage || "/images/avatar-placeholder.jpg"}
          alt={user.name}
          className="h-16 w-16 rounded-full border border-line object-cover"
        />
        <div>
          <p className="text-lg font-bold text-ink">{name || user.name}</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="link-underline mt-0.5 flex items-center gap-1 text-sm font-semibold text-primary-700"
          >
            {dict.common.changePhoto}
            <Pencil size={12} />
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

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
        <FormField label={dict.common.name}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldInputClass()}
          />
        </FormField>
        <FormField label={dict.common.email}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldInputClass()}
          />
        </FormField>
        <FormField label={dict.common.phoneNumber}>
          <input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+20 100 000 0000"
            className={fieldInputClass()}
          />
        </FormField>

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
        </div>
      </form>
    </div>
  );
}
