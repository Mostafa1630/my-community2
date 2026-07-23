import Link from "next/link";
import { Code2, Smartphone, Figma, Megaphone, BarChart3, Briefcase, LucideIcon } from "lucide-react";
import type { Category } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";

const iconMap: Record<string, LucideIcon> = {
  code: Code2,
  smartphone: Smartphone,
  figma: Figma,
  megaphone: Megaphone,
  "bar-chart": BarChart3,
  briefcase: Briefcase
};

export default function CategoryPill({ category, locale }: { category: Category; locale: Locale }) {
  const Icon = iconMap[category.icon] ?? Code2;
  const name = locale === "ar" ? category.nameAr : category.nameEn;
  return (
    <Link
      href={`/${locale}/communities?category=${category.slug}`}
      className="hover-lift group flex h-full flex-col items-center gap-2.5 text-center"
    >
      <span className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-primary-50 to-accent-50 shadow-card">
        {category.image ? (
          <img
            src={category.image}
            alt={name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <Icon size={30} className="text-primary-600 transition-transform duration-300 group-hover:scale-110" />
        )}
      </span>
      <span className="text-sm font-medium text-ink">{name}</span>
    </Link>
  );
}
