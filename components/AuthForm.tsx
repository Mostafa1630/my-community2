"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, GraduationCap, Users } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
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
  const { loginWithEmail, register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState<"student" | "creator">("student");
  const [error, setError] = useState("");

  function redirectFor(role: "student" | "creator" | "admin") {
    if (role === "creator") router.push(`/${locale}/creator/dashboard`);
    else router.push(`/${locale}/my-communities`);
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError(locale === "ar" ? "من فضلك أدخل البريد وكلمة المرور" : "Please enter your email and password");
      return;
    }
    const found = loginWithEmail(email);
    if (!found) {
      setError(
        locale === "ar"
          ? "الحساب ده مش موجود. جرّب nour.hassan@student.marefa.dev أو ahmed.nabil@marefa.dev"
          : "No account found. Try nour.hassan@student.marefa.dev or ahmed.nabil@marefa.dev"
      );
      return;
    }
    redirectFor(found.role);
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name || !email || !password || !confirmPassword) {
      setError(locale === "ar" ? "من فضلك املأ كل الحقول" : "Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError(locale === "ar" ? "كلمتا المرور غير متطابقتين" : "Passwords don't match");
      return;
    }
    const newUser = register({ name, email, role: accountType });
    redirectFor(newUser.role as "student" | "creator");
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
          <p className="mt-1.5 text-sm text-ink/55">
            {isLogin ? dict.auth.loginSubtitle : dict.auth.registerSubtitle}
          </p>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
          {!isLogin && (
            <Field label={dict.auth.fullName}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="Nour Hassan"
              />
            </Field>
          )}

          <Field label={dict.auth.email}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@example.com"
            />
          </Field>

          <Field label={dict.auth.password}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
            />
          </Field>

          {!isLogin && (
            <>
              <Field label={dict.auth.confirmPassword}>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </Field>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink/60">{dict.auth.accountType}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountType("student")}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-medium transition ${
                      accountType === "student"
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-line text-ink/60"
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
                        : "border-line text-ink/60"
                    }`}
                  >
                    <Users size={18} />
                    {dict.auth.accountTypeCreator}
                  </button>
                </div>
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
            className="w-full rounded-full bg-primary-500 py-3 text-sm font-semibold text-white transition hover:bg-primary-600"
          >
            {isLogin ? dict.auth.loginButton : dict.auth.registerButton}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-ink/50">
          {isLogin ? dict.auth.noAccount : dict.auth.haveAccount}{" "}
          <Link
            href={isLogin ? `/${locale}/register` : `/${locale}/login`}
            className="link-underline font-medium text-primary-700"
          >
            {isLogin ? dict.auth.signUp : dict.auth.signIn}
          </Link>
        </p>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400";


function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink/60">{label}</label>
      {children}
    </div>
  );
}
