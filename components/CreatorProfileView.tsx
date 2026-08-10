"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Pencil } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { initials } from "@/lib/accents";
import { apiFieldErrors } from "@/lib/validation/creatorForms";
import DashboardPageHeader from "./DashboardPageHeader";
import FormField, { fieldInputClass } from "./FormField";
import ImageCropper from "./ImageCropper";

const API_FIELD_MAP: Record<string, string> = {
  name: "name",
  email: "email",
  phone_number: "phoneNumber",
  bio: "bio"
};

// Edit-only form — the display-first view lives in CreatorProfileDisplayView
// (rendered at /creator/profile), same list/display+edit split as My Community.
// On save this navigates back to that display page rather than staying put,
// per the same "save takes you a step back to see it displayed" pattern.
export default function CreatorProfileView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFailed, setCoverFailed] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  // The raw picked file waits here until the crop/reposition step is
  // confirmed — avatarFile/coverFile (what actually gets uploaded) only get
  // set from the cropper's output, never directly from the <input>.
  const [cropTarget, setCropTarget] = useState<"avatar" | "cover" | null>(null);
  const [cropSourceFile, setCropSourceFile] = useState<File | null>(null);

  useEffect(() => {
    if (user && user.role === "creator") {
      setName(user.name);
      setEmail(user.email);
      setPhoneNumber(user.phoneNumber ?? "");
      setBio(user.bioEn);
    }
  }, [user]);

  if (!user || user.role !== "creator") return null;

  function handleCropConfirm(blob: Blob) {
    const file = new File([blob], `${cropTarget}.jpg`, { type: "image/jpeg" });
    const url = URL.createObjectURL(blob);
    if (cropTarget === "avatar") {
      setAvatarFile(file);
      setAvatarPreview(url);
    } else if (cropTarget === "cover") {
      setCoverFile(file);
      setCoverPreview(url);
      setCoverFailed(false);
    }
    setCropTarget(null);
    setCropSourceFile(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setSubmitting(true);
    try {
      await updateProfile(
        {
          name,
          email,
          phoneNumber,
          bio,
          image: avatarFile ?? undefined,
          coverImage: coverFile ?? undefined
        },
        locale
      );
      router.push(`/${locale}/creator/profile`);
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(apiFieldErrors(err.fieldErrors, API_FIELD_MAP));
        setError(err.message);
      } else {
        setError(dict.changePassword.genericError);
      }
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <DashboardPageHeader title={dict.creatorDash.profileEditCta} subtitle={dict.creatorDash.profileSubtitle} />

      <div className="mb-6 rounded-2xl border border-line bg-surface shadow-card">
        <div className="relative h-48 overflow-hidden rounded-t-2xl sm:h-64">
          {(coverPreview || user.coverImage) && !coverFailed ? (
            <img
              src={coverPreview || user.coverImage}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setCoverFailed(true)}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700" />
          )}
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="absolute end-3 top-3 rounded-full bg-ink/60 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur hover:bg-ink/75"
          >
            {dict.common.changeCover}
          </button>
          {/* z-10 — the avatar (painted after this cover in DOM order, since
              it straddles this same bottom-left corner) would otherwise
              paint over this label and hide it. */}
          <span className="absolute bottom-3 left-3 z-10 flex items-center justify-center rounded-md bg-ink/60 px-2 py-1 text-center text-[11px] font-medium text-white backdrop-blur">
            1200 × 400
          </span>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              if (file) {
                setCropSourceFile(file);
                setCropTarget("cover");
              }
              e.target.value = "";
            }}
          />
        </div>

        <div className="flex items-end gap-4 px-5 pb-6 sm:px-8">
          <div className="relative -mt-14 sm:-mt-16">
            <img
              src={avatarPreview || user.profileImage || "/images/avatar-placeholder.jpg"}
              alt={user.name}
              className="h-28 w-28 rounded-full border-4 border-surface object-cover shadow-raised sm:h-32 sm:w-32"
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              aria-label={dict.common.changePhoto}
              className="absolute -bottom-1 -end-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-primary-500 text-white transition hover:bg-primary-600"
            >
              <Pencil size={14} />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                if (file) {
                  setCropSourceFile(file);
                  setCropTarget("avatar");
                }
                e.target.value = "";
              }}
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label={dict.common.name} error={fieldErrors.name}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldInputClass(!!fieldErrors.name)}
            />
          </FormField>
          <FormField label={dict.common.email} error={fieldErrors.email}>
            <input
              dir="ltr"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldInputClass(!!fieldErrors.email)}
            />
          </FormField>
          <FormField label={dict.common.phoneNumber} error={fieldErrors.phoneNumber}>
            <input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+20 100 000 0000"
              className={fieldInputClass(!!fieldErrors.phoneNumber)}
            />
          </FormField>
        </div>

        <FormField label={dict.creatorDash.fieldBio} error={fieldErrors.bio}>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className={`${fieldInputClass(!!fieldErrors.bio)} resize-none`}
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
            className="rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-60"
          >
            {dict.common.save}
          </button>
        </div>
      </form>

      {cropTarget && cropSourceFile && (
        <ImageCropper
          file={cropSourceFile}
          aspect={cropTarget === "avatar" ? 1 : 3}
          shape={cropTarget === "avatar" ? "circle" : "rect"}
          outputSize={cropTarget === "avatar" ? { width: 500, height: 500 } : { width: 1200, height: 400 }}
          dict={dict}
          onConfirm={handleCropConfirm}
          onCancel={() => {
            setCropTarget(null);
            setCropSourceFile(null);
          }}
        />
      )}
    </div>
  );
}
