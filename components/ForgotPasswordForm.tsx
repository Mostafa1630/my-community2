"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { forgotPasswordSchema } from "@/lib/validation/auth";
import Seal from "./Seal";

export default function ForgotPasswordForm({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = forgotPasswordSchema({
      required: dict.changePassword.requiredError,
      invalidEmail: dict.auth.invalidEmailError
    }).safeParse({ email });
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? "");
      return;
    }
    setFieldError("");
    setSubmitting(true);
    try {
      await forgotPassword(result.data.email, locale);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : dict.auth.genericError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 shadow-card">
        <div className="mb-6 flex flex-col items-center text-center">
          <Seal size={44} label={dict.meta.siteName[0]} />
          <h1 className="mt-4 text-xl font-bold text-ink">{dict.auth.forgotPasswordTitle}</h1>
          <p className="mt-1.5 text-sm text-ink/65">{dict.auth.forgotPasswordSubtitle}</p>
        </div>

        {sent ? (
          <p className="flex items-start gap-2 rounded-xl bg-success/10 px-3 py-2.5 text-xs text-success">
            <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
            {dict.auth.resetLinkSent}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink/65">{dict.auth.email}</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
                placeholder="you@example.com"
              />
              {fieldError && <p className="mt-1 text-xs text-danger">{fieldError}</p>}
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
              {submitting ? dict.auth.submitting : dict.auth.sendResetLink}
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-xs text-ink/65">
          <Link href={`/${locale}/login`} className="link-underline font-medium text-primary-700">
            {dict.auth.backToLogin}
          </Link>
        </p>
      </div>
    </div>
  );
}
