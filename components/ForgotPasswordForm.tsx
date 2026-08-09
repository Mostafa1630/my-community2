"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { forgotPasswordSchema, resetPasswordSchema } from "@/lib/validation/auth";
import { apiFieldErrors } from "@/lib/validation/creatorForms";
import Seal from "./Seal";
import OtpCodeInput from "./OtpCodeInput";

const RESEND_COOLDOWN_SECONDS = 30;

const PASSWORD_FIELD_MAP: Record<string, string> = {
  password: "password",
  password_confirmation: "passwordConfirmation"
};

// Single-page, two-step flow: email -> 5-digit code emailed by the backend +
// new password. Replaces the old email-link-with-token page (deleted along
// with /reset-password) — the backend now emails a short numeric code
// instead of a clickable link, so there's no URL to land on with query
// params anymore, just this form advancing in place.
export default function ForgotPasswordForm({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const router = useRouter();
  const { forgotPassword, verifyResetCode, resetPassword } = useAuth();

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [emailFieldError, setEmailFieldError] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);

  const [code, setCode] = useState("");
  const [codeState, setCodeState] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [codeError, setCodeError] = useState("");

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendNotice, setResendNotice] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Auto-verifies as soon as all 5 digits are in, rather than waiting for a
  // separate "verify" button — the code either resolves instantly (valid,
  // reveals the password fields) or comes back invalid/expired right away.
  useEffect(() => {
    if (code.length !== 5) {
      setCodeState("idle");
      return;
    }
    let cancelled = false;
    setCodeState("checking");
    setCodeError("");
    verifyResetCode(email, code, locale)
      .then(() => {
        if (!cancelled) setCodeState("valid");
      })
      .catch((err) => {
        if (cancelled) return;
        setCodeState("invalid");
        setCodeError(err instanceof ApiError ? err.message : dict.auth.genericError);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, email, locale]);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = forgotPasswordSchema({
      required: dict.changePassword.requiredError,
      invalidEmail: dict.auth.invalidEmailError
    }).safeParse({ email });
    if (!result.success) {
      setEmailFieldError(result.error.issues[0]?.message ?? "");
      return;
    }
    setEmailFieldError("");
    setEmailSubmitting(true);
    try {
      await forgotPassword(result.data.email, locale);
      setStep("code");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : dict.auth.genericError);
    } finally {
      setEmailSubmitting(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setError("");
    setResendNotice(false);
    try {
      await forgotPassword(email, locale);
      setCode("");
      setCodeState("idle");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setResendNotice(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : dict.auth.genericError);
    }
  }

  async function handleResetSubmit(e: React.FormEvent) {
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
      await resetPassword(
        { email, code, password: result.data.password, passwordConfirmation: result.data.passwordConfirmation },
        locale
      );
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(apiFieldErrors(err.fieldErrors, PASSWORD_FIELD_MAP));
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
          <h1 className="mt-4 text-xl font-bold text-ink">
            {done
              ? dict.auth.resetSuccessTitle
              : step === "email"
                ? dict.auth.forgotPasswordTitle
                : dict.auth.enterCodeTitle}
          </h1>
          <p className="mt-1.5 text-sm text-ink/65">
            {done
              ? dict.auth.resetSuccess
              : step === "email"
                ? dict.auth.forgotPasswordSubtitle
                : dict.auth.enterCodeSubtitle.replace("{email}", email)}
          </p>
        </div>

        {done ? (
          <div className="text-center">
            <span className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 size={24} />
            </span>
            <Link
              href={`/${locale}/login`}
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-primary-500 py-3 text-sm font-semibold text-white transition hover:bg-primary-600"
            >
              {dict.auth.backToLogin}
            </Link>
          </div>
        ) : step === "email" ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink/65">{dict.auth.email}</span>
              <div className="relative">
                <Mail size={15} className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-line bg-paper py-2.5 ps-9 pe-3.5 text-sm outline-none focus:border-primary-400"
                  placeholder="you@example.com"
                />
              </div>
              {emailFieldError && <p className="mt-1 text-xs text-danger">{emailFieldError}</p>}
            </label>

            {error && (
              <p className="flex items-start gap-2 rounded-xl bg-danger/10 px-3 py-2.5 text-xs text-danger">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={emailSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-500 py-3 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:opacity-80"
            >
              {emailSubmitting && <Loader2 size={16} className="animate-spin" />}
              {emailSubmitting ? dict.auth.submitting : dict.auth.sendResetCode}
            </button>
          </form>
        ) : (
          <div className="space-y-5">
            <OtpCodeInput value={code} onChange={setCode} disabled={submitting} error={codeState === "invalid" ? codeError : undefined} />

            <div className="flex items-center justify-center gap-1.5 text-xs">
              {codeState === "checking" && (
                <span className="flex items-center gap-1.5 text-ink/55">
                  <Loader2 size={13} className="animate-spin" />
                  {dict.auth.verifyingCode}
                </span>
              )}
              {codeState === "valid" && (
                <span className="flex items-center gap-1.5 font-medium text-success">
                  <CheckCircle2 size={13} />
                  {dict.auth.codeVerified}
                </span>
              )}
            </div>

            <div className="text-center text-xs text-ink/55">
              {resendNotice && <p className="mb-1.5 text-success">{dict.auth.resendCodeSent}</p>}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="link-underline font-medium text-primary-700 disabled:pointer-events-none disabled:text-ink/40"
              >
                {resendCooldown > 0 ? dict.auth.resendCodeIn.replace("{seconds}", String(resendCooldown)) : dict.auth.resendCode}
              </button>
            </div>

            {codeState === "valid" && (
              <form onSubmit={handleResetSubmit} className="space-y-4 border-t border-line pt-5">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-ink/65">{dict.changePassword.newPasswordLabel}</span>
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
                  <span className="mb-1.5 block text-xs font-medium text-ink/65">{dict.changePassword.confirmPasswordLabel}</span>
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
            )}
          </div>
        )}

        {!done && (
          <p className="mt-5 text-center text-xs text-ink/65">
            <Link href={`/${locale}/login`} className="link-underline font-medium text-primary-700">
              {dict.auth.backToLogin}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
