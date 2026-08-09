import { ShieldCheck } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { getLegalSections } from "@/lib/api-content";
import { resolveLegalIcon } from "@/lib/legalIcons";
import LegalSection from "./LegalSection";

export default async function PrivacyPolicySection({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const sections = await getLegalSections("privacy-policy", locale);
  const items = sections.map((s) => ({
    icon: resolveLegalIcon(s.icon),
    question: s.title,
    answer: s.content
  }));

  return (
    <LegalSection
      id="privacy"
      locale={locale}
      badgeIcon={ShieldCheck}
      badgeLabel={dict.legal.privacyBadge}
      title={dict.legal.privacyTitle}
      subtitle={dict.legal.privacySubtitle}
      lastUpdatedLabel={dict.legal.lastUpdatedLabel}
      sectionsLabel={dict.legal.privacySectionsLabel}
      items={items}
      className="bg-surface"
    />
  );
}
