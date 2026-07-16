import type { LucideIcon } from "lucide-react";

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary"
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "primary" | "accent";
}) {
  const iconBg = tone === "primary" ? "bg-primary-50 text-primary-700" : "bg-accent-50 text-accent-700";
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between">
        <span className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBg}`}>
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-4 font-mono text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-sm text-ink/55">{label}</p>
    </div>
  );
}
