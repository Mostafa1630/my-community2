import type { LucideIcon } from "lucide-react";

export default function ProfileInfoField({
  label,
  value,
  icon: Icon,
  dir,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-line bg-paper px-3 py-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-800">
        <Icon size={20} strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-[13px] font-medium text-ink/55">{label}</p>
        <p className="text-sm font-semibold text-ink" dir={dir}>
          <span className="break-all">{value || "—"}</span>
        </p>
      </div>
    </div>
  );
}
