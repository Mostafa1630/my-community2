import type { Dictionary } from "@/lib/i18n/getDictionary";
import SectionHeading from "./SectionHeading";
import FaqAccordion from "./FaqAccordion";

export default function PrivacyPolicySection({ dict }: { dict: Dictionary }) {
  const items = [
    { question: dict.legal.privacyCollect, answer: dict.legal.privacyCollectBody },
    { question: dict.legal.privacyUse, answer: dict.legal.privacyUseBody },
    { question: dict.legal.privacyPayments, answer: dict.legal.privacyPaymentsBody },
    { question: dict.legal.privacyControl, answer: dict.legal.privacyControlBody }
  ];

  return (
    <section id="privacy" className="bg-surface py-14 sm:py-16">
      <div className="container-page">
        <SectionHeading eyebrow={dict.legal.privacyEyebrow} title={dict.legal.privacyTitle} subtitle={dict.legal.privacySubtitle} />
        <FaqAccordion items={items} />
      </div>
    </section>
  );
}
