import { ShieldCheck, Database, Settings2, UserCog } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import LegalSection from "./LegalSection";

export default function PrivacyPolicySection({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items = [
    { icon: Database, question: dict.legal.privacyCollect, answer: dict.legal.privacyCollectBody },
    { icon: Settings2, question: dict.legal.privacyUse, answer: dict.legal.privacyUseBody },
    { icon: ShieldCheck, question: dict.legal.privacyPayments, answer: dict.legal.privacyPaymentsBody },
    { icon: UserCog, question: dict.legal.privacyControl, answer: dict.legal.privacyControlBody }
  ];

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
