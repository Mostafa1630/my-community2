"use client";

import { useState } from "react";
import { AlertCircle, Mail, Phone, Send, User } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import SectionHeading from "./SectionHeading";

// No contact-form backend endpoint exists yet, so submitting composes a
// mailto: link (opens the visitor's own email app with the message
// pre-filled) rather than silently pretending to send it somewhere real —
// swap this for a real API call once a backend endpoint/address exists.
const CONTACT_EMAIL = "hello@nadi-community.com";

export default function ContactSection({ dict }: { dict: Dictionary }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError(dict.legal.contactRequiredError);
      return;
    }
    setError("");
    const body = [`${dict.legal.contactName}: ${name}`, phone.trim() && `${dict.legal.contactPhone}: ${phone}`, "", message]
      .filter(Boolean)
      .join("\n");
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`${dict.legal.contactTitle} — ${name}`)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
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
            className="mt-5 flex items-center gap-1.5 rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-600"
          >
            <Send size={14} className="rtl:-scale-x-100" />
            {dict.legal.contactSubmit}
          </button>
          <p className="mt-2.5 text-xs leading-5 text-ink/50">{dict.legal.contactOpensEmail}</p>
        </form>
      </div>
    </section>
  );
}
