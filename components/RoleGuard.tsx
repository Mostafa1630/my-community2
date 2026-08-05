"use client";

import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Role } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";
import { useAuth } from "@/lib/auth-context";

export default function RoleGuard({
  allow,
  locale,
  message,
  children
}: {
  allow: Role;
  locale: Locale;
  message: string;
  children: ReactNode;
}) {
  const { role } = useAuth();

  if (role !== allow) {
    return (
      <div className="container-page py-20">
        <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-14 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-50 text-accent-600">
            <ShieldAlert size={24} />
          </span>
          <p className="mb-5 text-sm text-ink/65">{message}</p>
          <Link href={`/${locale}`} className="rounded-full bg-primary-500 px-5 py-2.5 text-sm font-medium text-white">
            {locale === "ar" ? "العودة للرئيسية" : "Back home"}
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
