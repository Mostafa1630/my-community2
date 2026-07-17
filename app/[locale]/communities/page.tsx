import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { localizedAlternates } from "@/lib/seo";
import { categories, activeCommunities } from "@/lib/data";
import CommunitiesExplorer from "@/components/CommunitiesExplorer";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return {
    title: dict.communities.title,
    description: dict.communities.subtitle,
    alternates: localizedAlternates(locale, "/communities")
  };
}

export default function CommunitiesPage({
  params,
  searchParams
}: {
  params: { locale: string };
  searchParams: { category?: string };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);

  return (
    <div className="container-page py-12">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-bold text-ink">{dict.communities.title}</h1>
        <p className="mt-2 text-sm text-ink/60">{dict.communities.subtitle}</p>
      </div>
      <CommunitiesExplorer
        communities={activeCommunities}
        categories={categories}
        locale={locale}
        dict={dict}
        initialCategory={searchParams.category}
      />
    </div>
  );
}
