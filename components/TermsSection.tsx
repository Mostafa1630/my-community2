import { FileCheck2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { getLegalSections } from "@/lib/api-content";
import { resolveLegalIcon } from "@/lib/legalIcons";
import LegalSection from "./LegalSection";

export default async function TermsSection({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const sections = await getLegalSections("terms-conditions", locale);
  const items = sections.map((s) => ({
    icon: resolveLegalIcon(s.icon),
    question: s.title,
    answer: s.content
  }));

  return (
    <LegalSection
      id="terms"
      locale={locale}
      badgeIcon={FileCheck2}
      badgeLabel={dict.legal.termsBadge}
      title={dict.legal.termsTitle}
      subtitle={dict.legal.termsSubtitle}
      lastUpdatedLabel={dict.legal.lastUpdatedLabel}
      sectionsLabel={dict.legal.termsSectionsLabel}
      items={items}
    />
  );
}
