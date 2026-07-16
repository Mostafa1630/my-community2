import type { ReactNode } from "react";

export default function DashboardPageHeader({
  title,
  subtitle,
  action
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="relative mb-6 flex flex-wrap items-center justify-between gap-3 overflow-hidden rounded-2xl bg-gradient-to-l from-primary-500 to-primary-600 px-5 py-4 text-white shadow-raised">
      <div className="pointer-events-none absolute -end-6 -top-10 h-32 w-32 rounded-full bg-accent-400/20 blur-2xl" />
      <div className="relative min-w-0">
        <h1 className="text-lg font-bold sm:text-xl">{title}</h1>
        {subtitle && <p className="mt-1 text-xs text-white/70 sm:text-sm">{subtitle}</p>}
      </div>
      {action && <div className="relative shrink-0">{action}</div>}
    </div>
  );
}
