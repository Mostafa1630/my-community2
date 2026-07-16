import type { ReactNode } from "react";

const tones = {
  neutral: "bg-ink/5 text-ink/70",
  primary: "bg-primary-50 text-primary-700",
  accent: "bg-accent-50 text-accent-700",
  success: "bg-success/10 text-success",
  danger: "bg-danger/10 text-danger",
  pending: "bg-accent-50 text-accent-700",
};

export default function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: keyof typeof tones;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
