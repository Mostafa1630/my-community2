import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export default function EmptyState({
  icon: Icon,
  image,
  title,
  action
}: {
  icon?: LucideIcon;
  // An illustration to show instead of the plain icon badge, for the
  // higher-visibility "nothing here" spots (top creators, communities,
  // creators) where a small icon reads as an afterthought.
  image?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-16 text-center">
      {image ? (
        <img src={image} alt="" className="mb-4 h-40 w-40 object-contain sm:h-48 sm:w-48" />
      ) : (
        Icon && (
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <Icon size={24} />
          </span>
        )
      )}
      <p className="mb-4 max-w-sm text-sm text-ink/65">{title}</p>
      {action}
    </div>
  );
}
