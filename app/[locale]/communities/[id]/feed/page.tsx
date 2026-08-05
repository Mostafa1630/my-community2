import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { t } from "@/lib/i18n/t";
import { getCommunityBySlug } from "@/lib/data";
import CreatorCommunityGate from "@/components/CreatorCommunityGate";

export async function generateMetadata({
  params
}: {
  params: { locale: string; id: string };
}): Promise<Metadata> {
  const community = getCommunityBySlug(params.id);
  if (!community) return {};
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const name = locale === "ar" ? community.nameAr : community.nameEn;
  return { title: name, robots: { index: false } };
}

export default function CommunityFeedPage({ params }: { params: { locale: string; id: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  const community = getCommunityBySlug(params.id);
  if (!community) notFound();
  const name = locale === "ar" ? community.nameAr : community.nameEn;

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-ink">{t(dict.community.feedTitle, { name })}</h1>
        <p className="mt-1.5 text-sm text-ink/65">{dict.community.feedSubtitle}</p>
      </div>
      <CreatorCommunityGate creatorId={community.creatorId} communityId={community.id} locale={locale} dict={dict} />
    </div>
  );
}
