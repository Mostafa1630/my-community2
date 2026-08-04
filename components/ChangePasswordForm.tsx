"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { changePasswordSchema } from "@/lib/validation/changePassword";

const inputClass =
  "w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400";

export default function ChangePasswordForm({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { changePassword } = useAuth();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSuccess(false);

    const schema = changePasswordSchema({
      required: dict.changePassword.requiredError,
      minLength: dict.changePassword.minLengthError,
      mismatch: dict.changePassword.mismatchError
    });
    const result = schema.safeParse({ oldPassword, newPassword, newPasswordConfirmation });
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
      await changePassword(result.data, locale);
      setSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setNewPasswordConfirmation("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      if (err instanceof ApiError) {
        const apiFieldErrors: Record<string, string> = {};
        const oldPasswordError = err.fieldError("old_password");
        const newPasswordError = err.fieldError("new_password");
        const confirmError = err.fieldError("new_password_confirmation");
        if (oldPasswordError) apiFieldErrors.oldPassword = oldPasswordError;
        if (newPasswordError) apiFieldErrors.newPassword = newPasswordError;
        if (confirmError) apiFieldErrors.newPasswordConfirmation = confirmError;
        if (Object.keys(apiFieldErrors).length > 0) {
          setFieldErrors(apiFieldErrors);
        } else {
          setFormError(err.message || dict.changePassword.genericError);
        }
      } else {
        setFormError(dict.changePassword.genericError);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-line bg-surface p-6 shadow-card"
    >
      <div>
        <h2 className="text-sm font-semibold text-ink">{dict.changePassword.title}</h2>
        <p className="mt-0.5 text-xs text-ink/50">{dict.changePassword.subtitle}</p>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-ink/60">
          {dict.changePassword.currentPasswordLabel}
        </label>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          placeholder="••••••••"
          className={inputClass}
        />
        {fieldErrors.oldPassword && <p className="mt-1 text-xs text-danger">{fieldErrors.oldPassword}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-ink/60">
          {dict.changePassword.newPasswordLabel}
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="••••••••"
          className={inputClass}
        />
        {fieldErrors.newPassword && <p className="mt-1 text-xs text-danger">{fieldErrors.newPassword}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-ink/60">
          {dict.changePassword.confirmPasswordLabel}
        </label>
        <input
          type="password"
          value={newPasswordConfirmation}
          onChange={(e) => setNewPasswordConfirmation(e.target.value)}
          placeholder="••••••••"
          className={inputClass}
        />
        {fieldErrors.newPasswordConfirmation && (
          <p className="mt-1 text-xs text-danger">{fieldErrors.newPasswordConfirmation}</p>
        )}
      </div>

      {formError && (
        <p className="flex items-start gap-2 rounded-xl bg-danger/10 px-3 py-2.5 text-xs text-danger">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          {formError}
        </p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:opacity-60"
        >
          {dict.changePassword.submitButton}
        </button>
        {success && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-success">
            <CheckCircle2 size={14} />
            {dict.changePassword.successMessage}
          </span>
        )}
      </div>
    </form>
  );
}
