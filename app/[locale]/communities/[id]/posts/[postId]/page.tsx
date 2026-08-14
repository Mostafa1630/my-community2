import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getCommunityDetails } from "@/lib/api-content";
import RealPostDetailView from "@/components/RealPostDetailView";

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string; id: string; postId: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const community = await getCommunityDetails(params.id, locale);
  if (!community) return {};
  return { title: community.name, robots: { index: false } };
}

export default async function PostDetailPage(
  props: {
    params: Promise<{ locale: string; id: string; postId: string }>;
    searchParams: Promise<{ tab?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  const community = await getCommunityDetails(params.id, locale);
  if (!community) notFound();

  const initialTab = searchParams.tab === "reactions" ? "reactions" : "comments";

  return (
    <div className="container-page py-8 sm:py-10">
      <RealPostDetailView
        postId={params.postId}
        communityId={community.id}
        creatorId={community.creator.id}
        communityType={community.type}
        initialTab={initialTab}
        locale={locale}
        dict={dict}
      />
    </div>
  );
}
