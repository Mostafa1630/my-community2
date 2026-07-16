"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, UserRound } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import { usePlatformStore } from "@/lib/platform-store";
import type { Student } from "@/lib/types";
import EmptyState from "./EmptyState";

export default function StudentProfileView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { user, role } = useAuth();
  const store = usePlatformStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  if (role !== "student" || !user) {
    return <EmptyState icon={UserRound} title={dict.common.empty} />;
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6 flex items-center gap-4">
        <img
          src={user.profileImage || "/images/avatar-placeholder.jpg"}
          alt=""
          className="h-16 w-16 rounded-full border border-line object-cover"
        />
        <p className="text-sm font-medium text-ink/60">{name || user.name}</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          store.users.update(user.id, { name, email } satisfies Partial<Student>);
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        }}
        className="space-y-4 rounded-2xl border border-line bg-surface p-6 shadow-card"
      >
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink/60">{dict.common.name}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink/60">{dict.common.email}</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink/60">{dict.auth.password}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
          />
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-600"
          >
            {dict.common.save}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-success">
              <CheckCircle2 size={14} />
              {locale === "ar" ? "تم الحفظ" : "Saved"}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
