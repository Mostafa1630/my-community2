"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { resetPasswordSchema } from "@/lib/validation/auth";
import { apiFieldErrors } from "@/lib/validation/creatorForms";
import Seal from "./Seal";

const API_FIELD_MAP: Record<string, string> = {
  password: "password",
  password_confirmation: "passwordConfirmation"
};

export default function ResetPasswordForm({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword } = useAuth();

  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!email || !token) {
    return (
      <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
        <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 text-center shadow-card">
          <Seal size={44} label={dict.meta.siteName[0]} />
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-danger/10 px-3 py-2.5 text-start text-xs text-danger">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            {dict.auth.invalidResetLink}
          </p>
          <Link
            href={`/${locale}/forgot-password`}
            className="link-underline mt-4 inline-block text-sm font-medium text-primary-700"
          >
            {dict.auth.forgotPasswordTitle}
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = resetPasswordSchema({
      required: dict.changePassword.requiredError,
      minLength: dict.changePassword.minLengthError,
      mismatch: dict.changePassword.mismatchError
    }).safeParse({ password, passwordConfirmation });
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await resetPassword({ email, token, password: result.data.password, passwordConfirmation: result.data.passwordConfirmation }, locale);
      router.push(`/${locale}/login?registered=1`);
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(apiFieldErrors(err.fieldErrors, API_FIELD_MAP));
        setError(err.message);
      } else {
        setError(dict.auth.genericError);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 shadow-card">
        <div className="mb-6 flex flex-col items-center text-center">
          <Seal size={44} label={dict.meta.siteName[0]} />
          <h1 className="mt-4 text-xl font-bold text-ink">{dict.auth.resetPasswordTitle}</h1>
          <p className="mt-1.5 text-sm text-ink/65">{dict.auth.resetPasswordSubtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-ink/65">
              {dict.changePassword.newPasswordLabel}
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
              placeholder="••••••••"
            />
            {fieldErrors.password && <p className="mt-1 text-xs text-danger">{fieldErrors.password}</p>}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-ink/65">
              {dict.changePassword.confirmPasswordLabel}
            </span>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
              placeholder="••••••••"
            />
            {fieldErrors.passwordConfirmation && (
              <p className="mt-1 text-xs text-danger">{fieldErrors.passwordConfirmation}</p>
            )}
          </label>

          {error && (
            <p className="flex items-start gap-2 rounded-xl bg-danger/10 px-3 py-2.5 text-xs text-danger">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-500 py-3 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:opacity-80"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting ? dict.auth.submitting : dict.auth.resetButton}
          </button>
        </form>
      </div>
    </div>
  );
}
