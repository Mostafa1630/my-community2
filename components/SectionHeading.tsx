import type { ReactNode } from "react";

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
  as = "h2"
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  as?: "h1" | "h2";
}) {
  const Heading = as;
  return (
    <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent-600">
            {eyebrow}
          </p>
        )}
        <Heading className="text-2xl font-bold text-ink sm:text-3xl">{title}</Heading>
        {subtitle && <p className="mt-2 max-w-xl text-sm text-ink/65">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
