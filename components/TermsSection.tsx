import { FileCheck2, MessagesSquare, CreditCard, Copyright } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import LegalSection from "./LegalSection";

export default function TermsSection({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items = [
    { icon: FileCheck2, question: dict.legal.termsAccount, answer: dict.legal.termsAccountBody },
    { icon: MessagesSquare, question: dict.legal.termsContent, answer: dict.legal.termsContentBody },
    { icon: CreditCard, question: dict.legal.termsPayments, answer: dict.legal.termsPaymentsBody },
    { icon: Copyright, question: dict.legal.termsIp, answer: dict.legal.termsIpBody }
  ];

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
