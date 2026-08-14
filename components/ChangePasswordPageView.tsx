"use client";

import { KeyRound } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import ChangePasswordForm from "./ChangePasswordForm";
import EmptyState from "./EmptyState";


export default function ChangePasswordPageView({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { user } = useAuth();

  if (!user) {
    return <EmptyState icon={KeyRound} title={dict.common.empty} />;
  }

  return (
    <div className="mx-auto max-w-lg">
      <ChangePasswordForm locale={locale} dict={dict} />
    </div>
  );
}
