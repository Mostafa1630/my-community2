import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getCategories } from "@/lib/api-content";
import EditCommunityView from "@/components/EditCommunityView";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return { title: dict.creatorDash.communitySaveButton, robots: { index: false } };
}

export default async function EditCommunityPage({ params }: { params: { locale: string; id: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  const categories = await getCategories(locale);
  return <EditCommunityView communityId={params.id} locale={locale} dict={dict} categories={categories} />;
}
