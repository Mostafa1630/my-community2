import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { localizedAlternates } from "@/lib/seo";
import { categories, creators } from "@/lib/data";
import CreatorsExplorer from "@/components/CreatorsExplorer";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return {
    title: dict.creatorsPage.title,
    description: dict.creatorsPage.subtitle,
    alternates: localizedAlternates(locale, "/creators")
  };
}

export default function CreatorsPage({ params }: { params: { locale: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);

  return (
    <div className="container-page py-12">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-bold text-ink">{dict.creatorsPage.title}</h1>
        <p className="mt-2 text-sm text-ink/60">{dict.creatorsPage.subtitle}</p>
      </div>
      <CreatorsExplorer creators={creators} categories={categories} locale={locale} dict={dict} />
    </div>
  );
}
