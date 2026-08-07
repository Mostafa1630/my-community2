import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { t } from "@/lib/i18n/t";
import { getCommunityDetails } from "@/lib/api-content";
import RealCommunityFeedView from "@/components/RealCommunityFeedView";

export async function generateMetadata({
  params
}: {
  params: { locale: string; id: string };
}): Promise<Metadata> {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const community = await getCommunityDetails(params.id, locale);
  if (!community) return {};
  return { title: community.name, robots: { index: false } };
}

export default async function CommunityFeedPage({ params }: { params: { locale: string; id: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  const community = await getCommunityDetails(params.id, locale);
  if (!community) notFound();

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="mx-auto mb-6 max-w-2xl sm:mb-8">
        <h1 className="text-2xl font-bold text-ink">{t(dict.community.feedTitle, { name: community.name })}</h1>
        <p className="mt-1.5 text-sm text-ink/65">{dict.community.feedSubtitle}</p>
      </div>
      <RealCommunityFeedView
        communityId={community.id}
        creatorId={community.creator.id}
        communityType={community.type}
        locale={locale}
        dict={dict}
      />
    </div>
  );
}
