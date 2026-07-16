import type { ReactNode } from "react";

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent-600">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl font-bold text-ink sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-2 max-w-xl text-sm text-ink/60">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
