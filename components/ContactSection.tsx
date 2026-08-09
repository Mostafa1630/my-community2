"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Mail, Phone, Send, User } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import SectionHeading from "./SectionHeading";
import Modal from "./motion/Modal";

export default function ContactSection({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { submitContactUs } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError(dict.legal.contactRequiredError);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const apiMessage = await submitContactUs(
        { name: name.trim(), email: email.trim(), phone: phone.trim() || undefined, message: message.trim() },
        locale
      );
      setSuccessMessage(apiMessage);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : dict.legal.contactError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contact" className="py-14 sm:py-16">
      <div className="container-page">
        <SectionHeading eyebrow={dict.legal.contactEyebrow} title={dict.legal.contactTitle} subtitle={dict.legal.contactSubtitle} />
        <form onSubmit={handleSubmit} className="mx-auto max-w-2xl rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold tracking-wide text-ink/70">{dict.legal.contactName}</span>
              <div className="relative">
                <User size={16} className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink/40 start-3.5" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-line bg-paper py-3 text-sm outline-none transition-colors focus:border-primary-400 ps-10 pe-4"
                />
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold tracking-wide text-ink/70">{dict.legal.contactEmail}</span>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink/40 start-3.5" />
                <input
                  type="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-line bg-paper py-3 text-start text-sm outline-none transition-colors focus:border-primary-400 ps-10 pe-4"
                />
              </div>
            </label>
          </div>

          <label className="mt-5 block">
            <span className="mb-2 block text-xs font-semibold tracking-wide text-ink/70">{dict.legal.contactPhone}</span>
            <div className="relative">
              <Phone size={16} className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink/40 start-3.5" />
              <input
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+20 100 000 0000"
                className="w-full rounded-xl border border-line bg-paper py-3 text-start text-sm outline-none transition-colors focus:border-primary-400 ps-10 pe-4"
              />
            </div>
          </label>

          <label className="mt-5 block">
            <span className="mb-2 block text-xs font-semibold tracking-wide text-ink/70">{dict.legal.contactMessage}</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={dict.legal.contactMessagePlaceholder}
              rows={4}
              className="w-full resize-none rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-primary-400"
            />
          </label>

          {error && (
            <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-danger">
              <AlertCircle size={13} />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 flex items-center gap-1.5 rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:opacity-60"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} className="rtl:-scale-x-100" />}
            {dict.legal.contactSubmit}
          </button>
        </form>
      </div>

      <Modal open={successMessage !== null} onClose={() => setSuccessMessage(null)}>
        <div className="text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 size={24} />
          </span>
          <p className="text-sm leading-6 text-ink/80">{successMessage}</p>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="mt-5 rounded-full bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
          >
            {dict.common.close}
          </button>
        </div>
      </Modal>
    </section>
  );
}
