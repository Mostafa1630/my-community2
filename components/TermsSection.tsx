import { CreditCard, Copyright, MessagesSquare, UserCheck } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import SectionHeading from "./SectionHeading";

export default function TermsSection({ dict }: { dict: Dictionary }) {
  const points = [
    { icon: UserCheck, title: dict.legal.termsAccount, body: dict.legal.termsAccountBody },
    { icon: MessagesSquare, title: dict.legal.termsContent, body: dict.legal.termsContentBody },
    { icon: CreditCard, title: dict.legal.termsPayments, body: dict.legal.termsPaymentsBody },
    { icon: Copyright, title: dict.legal.termsIp, body: dict.legal.termsIpBody }
  ];

  return (
    <section id="terms" className="py-14 sm:py-16">
      <div className="container-page">
        <SectionHeading eyebrow={dict.legal.termsEyebrow} title={dict.legal.termsTitle} subtitle={dict.legal.termsSubtitle} />
        <div className="grid gap-5 sm:grid-cols-2">
          {points.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">
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
