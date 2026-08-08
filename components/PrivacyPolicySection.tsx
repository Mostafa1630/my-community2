import { CreditCard, Database, Settings2, Eye } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import SectionHeading from "./SectionHeading";

export default function PrivacyPolicySection({ dict }: { dict: Dictionary }) {
  const points = [
    { icon: Database, title: dict.legal.privacyCollect, body: dict.legal.privacyCollectBody },
    { icon: Eye, title: dict.legal.privacyUse, body: dict.legal.privacyUseBody },
    { icon: CreditCard, title: dict.legal.privacyPayments, body: dict.legal.privacyPaymentsBody },
    { icon: Settings2, title: dict.legal.privacyControl, body: dict.legal.privacyControlBody }
  ];

  return (
    <section id="privacy" className="bg-surface py-14 sm:py-16">
      <div className="container-page">
        <SectionHeading eyebrow={dict.legal.privacyEyebrow} title={dict.legal.privacyTitle} subtitle={dict.legal.privacySubtitle} />
        <div className="grid gap-5 sm:grid-cols-2">
          {points.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-line bg-paper p-5 shadow-card sm:p-6">
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <Icon size={19} />
              </span>
              <h3 className="mb-1.5 text-sm font-bold text-ink">{title}</h3>
              <p className="text-sm leading-6 text-ink/65">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
