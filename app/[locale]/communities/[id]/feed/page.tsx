import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getCommunityDetails } from "@/lib/api-content";
import CommunityFeedHeader from "@/components/CommunityFeedHeader";
import RealCommunityFeedView from "@/components/RealCommunityFeedView";

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string; id: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const community = await getCommunityDetails(params.id, locale);
  if (!community) return {};
  return { title: community.name, robots: { index: false } };
}

export default async function CommunityFeedPage(props: { params: Promise<{ locale: string; id: string }> }) {
  const params = await props.params;
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  const community = await getCommunityDetails(params.id, locale);
  if (!community) notFound();

  return (
    <>
      <div className="sticky top-16 z-30 border-b border-line bg-paper/95 backdrop-blur-sm">
        <div className="container-page py-4 sm:py-5">
          <CommunityFeedHeader
            community={community}
            locale={locale}
            dict={dict}
            feedSubtitle={dict.community.feedSubtitle}
          />
        </div>
      </div>
      <div className="container-page py-6 sm:py-8">
        <RealCommunityFeedView
          communityId={community.id}
          creatorId={community.creator.id}
          communityType={community.type}
          locale={locale}
          dict={dict}
        />
      </div>
    </>
  );
}
