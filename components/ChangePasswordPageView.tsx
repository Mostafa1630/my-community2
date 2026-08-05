"use client";

import { KeyRound } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import ChangePasswordForm from "./ChangePasswordForm";
import EmptyState from "./EmptyState";

// Standalone page now, split out of both profile views (which used to embed
// ChangePasswordForm directly) so it has its own dedicated URL, reachable
// from the "Change password" link in the navbar's account menu.
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
