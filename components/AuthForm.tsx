"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, GraduationCap, Loader2, Users } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { loginSchema, registerSchema } from "@/lib/validation/auth";
import Seal from "./Seal";

export default function AuthForm({
  mode,
  locale,
  dict
}: {
  mode: "login" | "register";
  locale: Locale;
  dict: Dictionary;
}) {
  const router = useRouter();
  const { login, register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState<"student" | "creator">("student");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function redirectFor(role: "student" | "creator" | "admin") {
    if (role === "creator") router.push(`/${locale}/creator/dashboard`);
    else router.push(`/${locale}/my-communities`);
  }

  const messages = {
    required: dict.changePassword.requiredError,
    invalidEmail: dict.auth.invalidEmailError,
    minLength: dict.changePassword.minLengthError,
    mismatch: dict.changePassword.mismatchError
  };

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = loginSchema(messages).safeParse({ email, password });
    if (!result.success) {
      setFieldErrors(collectIssues(result.error.issues));
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      const found = await login(result.data.email, result.data.password, locale);
      redirectFor(found.role);
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fieldErrors).length > 0) {
        setFieldErrors(mapApiErrors(err));
      } else {
        setError(err instanceof ApiError ? err.message : dict.auth.genericError);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = registerSchema(messages).safeParse({
      name,
      email,
      password,
      passwordConfirmation: confirmPassword,
      type: accountType
    });
    if (!result.success) {
      setFieldErrors(collectIssues(result.error.issues));
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await register(
        {
          name: result.data.name,
          email: result.data.email,
          password: result.data.password,
          passwordConfirmation: result.data.passwordConfirmation,
          type: result.data.type
        },
        locale
      );
      router.push(`/${locale}`);
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fieldErrors).length > 0) {
        setFieldErrors(mapApiErrors(err));
      } else {
        setError(err instanceof ApiError ? err.message : dict.auth.genericError);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const isLogin = mode === "login";

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 shadow-card">
        <div className="mb-6 flex flex-col items-center text-center">
          <Seal size={44} label={dict.meta.siteName[0]} />
          <h1 className="mt-4 text-xl font-bold text-ink">
            {isLogin ? dict.auth.loginTitle : dict.auth.registerTitle}
          </h1>
          <p className="mt-1.5 text-sm text-ink/65">
            {isLogin ? dict.auth.loginSubtitle : dict.auth.registerSubtitle}
          </p>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
          {!isLogin && (
            <Field label={dict.auth.fullName} error={fieldErrors.name}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="Nour Hassan"
              />
            </Field>
          )}

          <Field label={dict.auth.email} error={fieldErrors.email}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@example.com"
            />
          </Field>

          <div>
            <Field label={dict.auth.password} error={fieldErrors.password}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
              />
            </Field>
            {isLogin && (
              <Link
                href={`/${locale}/forgot-password`}
                className="link-underline mt-1.5 inline-block text-xs font-medium text-primary-700"
              >
                {dict.auth.forgotPassword}
              </Link>
            )}
          </div>

          {!isLogin && (
            <>
              <Field label={dict.auth.confirmPassword} error={fieldErrors.passwordConfirmation}>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </Field>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink/65">{dict.auth.accountType}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountType("student")}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-medium transition ${
                      accountType === "student"
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-line text-ink/65"
                    }`}
                  >
                    <GraduationCap size={18} />
                    {dict.auth.accountTypeStudent}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType("creator")}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-medium transition ${
                      accountType === "creator"
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-line text-ink/65"
                    }`}
                  >
                    <Users size={18} />
                    {dict.auth.accountTypeCreator}
                  </button>
                </div>
                {fieldErrors.accountType && (
                  <p className="mt-1 text-xs text-danger">{fieldErrors.accountType}</p>
                )}
              </div>
            </>
          )}

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
            {submitting
              ? dict.auth.submitting
              : isLogin
                ? dict.auth.loginButton
                : dict.auth.registerButton}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-ink/65">
          {isLogin ? dict.auth.noAccount : dict.auth.haveAccount}{" "}
          <Link
            href={isLogin ? `/${locale}/register` : `/${locale}/login`}
            className="link-underline font-medium text-primary-700"
          >
            {isLogin ? dict.auth.registerButton : dict.auth.loginButton}
          </Link>
        </p>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400";

function collectIssues(issues: { path: PropertyKey[]; message: string }[]) {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

// Maps the backend's snake_case field names (password_confirmation, ...) back
// onto this form's camelCase state keys so ApiError.fieldErrors can be shown
// under the right input.
function mapApiErrors(err: ApiError) {
  const errors: Record<string, string> = {};
  const map: Record<string, string> = {
    name: "name",
    email: "email",
    password: "password",
    password_confirmation: "passwordConfirmation",
    type: "accountType"
  };
  for (const [apiField, formField] of Object.entries(map)) {
    const message = err.fieldError(apiField);
    if (message) errors[formField] = message;
  }
  return errors;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink/65">{label}</span>
      {children}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </label>
  );
}
