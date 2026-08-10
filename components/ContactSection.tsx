"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Mail, MapPin, Phone, Send, User } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { PlatformSettings } from "@/lib/api-types";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import SectionHeading from "./SectionHeading";
import Modal from "./motion/Modal";

export default function ContactSection({
  locale,
  dict,
  settings
}: {
  locale: Locale;
  dict: Dictionary;
  settings: PlatformSettings | null;
}) {
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

  const contactRows = [
    settings?.contactEmail && { icon: Mail, label: dict.about.email, value: settings.contactEmail, href: `mailto:${settings.contactEmail}` },
    settings?.contactPhone && { icon: Phone, label: dict.about.phone, value: settings.contactPhone, href: `tel:${settings.contactPhone}` },
    settings?.contactAddress && { icon: MapPin, label: dict.about.address, value: settings.contactAddress, href: undefined }
  ].filter((row): row is { icon: typeof Mail; label: string; value: string; href?: string } => Boolean(row));

  const form = (
    <form
      onSubmit={handleSubmit}
      className={`bg-surface p-6 sm:p-10 ${contactRows.length > 0 ? "lg:col-span-3" : "mx-auto w-full max-w-2xl rounded-3xl border border-line shadow-card"}`}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold tracking-wide text-ink/70">{dict.legal.contactName}</span>
          <div className="relative">
            <User size={16} className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink/40 start-3.5" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-line bg-paper py-3 text-sm outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 ps-10 pe-4"
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
              className="w-full rounded-xl border border-line bg-paper py-3 text-start text-sm outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 ps-10 pe-4"
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
            className="w-full rounded-xl border border-line bg-paper py-3 text-start text-sm outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 ps-10 pe-4"
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
          className="w-full resize-none rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10"
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
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-500 py-3.5 text-sm font-semibold text-white shadow-raised transition hover:bg-primary-600 disabled:opacity-60 sm:w-auto sm:px-9"
      >
        {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} className="rtl:-scale-x-100" />}
        {dict.legal.contactSubmit}
      </button>
    </form>
  );

  return (
    <section id="contact" className="py-14 sm:py-16">
      <div className="container-page">
        {contactRows.length > 0 ? (
          <>
            <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-line shadow-raised lg:grid-cols-5">
              <div className="flex flex-col justify-between bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 p-8 text-white sm:p-10 lg:col-span-2">
                <div>
                  <h2 className="text-3xl font-extrabold sm:text-4xl">{dict.legal.contactTitle}</h2>
                  <p className="mt-3 max-w-sm text-sm leading-7 text-white/75">{dict.legal.contactSubtitle}</p>
                </div>
                <div className="mt-10 space-y-3">
                  {contactRows.map((row) => {
                    const Icon = row.icon;
                    const content = (
                      <>
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
                          <Icon size={18} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase tracking-wide text-white/55">{row.label}</p>
                          <p className="mt-0.5 truncate text-sm font-semibold text-white" dir="ltr">
                            {row.value}
                          </p>
                        </div>
                      </>
                    );
                    return row.href ? (
                      <a
                        key={row.label}
                        href={row.href}
                        className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm transition hover:bg-white/15"
                      >
                        {content}
                      </a>
                    ) : (
                      <div key={row.label} className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm">
                        {content}
                      </div>
                    );
                  })}
                </div>
              </div>
              {form}
            </div>
          </>
        ) : (
          <>
            <SectionHeading eyebrow={dict.legal.contactEyebrow} title={dict.legal.contactTitle} subtitle={dict.legal.contactSubtitle} />
            {form}
          </>
        )}
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
