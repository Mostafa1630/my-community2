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
      className="hover-lift group flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface p-5 text-center shadow-card hover:border-primary-300"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-700 transition-all duration-200 group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-white">
        <Icon size={20} />
      </span>
      <span className="text-sm font-medium text-ink">{name}</span>
    </Link>
  );
}
