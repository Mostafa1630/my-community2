import type { LucideIcon } from "lucide-react";

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",

  compact = false
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  tone?: "primary" | "accent";
  compact?: boolean;
}) {
  const iconBg = tone === "primary" ? "bg-primary-50 text-primary-700" : "bg-accent-50 text-accent-700";
  return (
    <div className={`rounded-2xl border border-line bg-surface shadow-card ${compact ? "p-4" : "p-5"}`}>
      {Icon && (
        <div className="flex items-center justify-between">
          <span className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBg}`}>
            <Icon size={18} />
          </span>
        </div>
      )}
      <p className={`font-mono font-semibold text-ink ${compact ? "text-lg" : "mt-4 text-2xl"}`}>{value}</p>
      <p className={`text-ink/65 ${compact ? "mt-1 text-xs" : "mt-1 text-sm"}`}>{label}</p>
    </div>
  );
}
