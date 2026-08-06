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
    <div className="relative mb-8 flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-2xl bg-gradient-to-l from-primary-500 to-primary-600 px-6 py-5 text-white shadow-raised sm:px-7 sm:py-6">
      <div className="pointer-events-none absolute -end-6 -top-10 h-32 w-32 rounded-full bg-accent-400/20 blur-2xl" />
      <div className="relative min-w-0">
        <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-sm leading-6 text-white/80 [word-spacing:0.2em]">{subtitle}</p>
        )}
      </div>
      {action && <div className="relative shrink-0">{action}</div>}
    </div>
  );
}
