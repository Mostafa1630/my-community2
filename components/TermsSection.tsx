import type { Dictionary } from "@/lib/i18n/getDictionary";
import SectionHeading from "./SectionHeading";
import FaqAccordion from "./FaqAccordion";

export default function TermsSection({ dict }: { dict: Dictionary }) {
  const items = [
    { question: dict.legal.termsAccount, answer: dict.legal.termsAccountBody },
    { question: dict.legal.termsContent, answer: dict.legal.termsContentBody },
    { question: dict.legal.termsPayments, answer: dict.legal.termsPaymentsBody },
    { question: dict.legal.termsIp, answer: dict.legal.termsIpBody }
  ];

  return (
    <section id="terms" className="py-14 sm:py-16">
      <div className="container-page">
        <SectionHeading eyebrow={dict.legal.termsEyebrow} title={dict.legal.termsTitle} subtitle={dict.legal.termsSubtitle} />
        <FaqAccordion items={items} />
      </div>
    </section>
  );
}
