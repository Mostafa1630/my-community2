import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getCommunityDetails } from "@/lib/api-content";
import CommunityCheckoutView from "@/components/CommunityCheckoutView";

export async function generateMetadata({
  params
}: {
  params: { locale: string; id: string };
}): Promise<Metadata> {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return { title: dict.communityDetails.checkoutTitle, robots: { index: false } };
}

export default async function CommunityCheckoutPage({
  params,
  searchParams
}: {
  params: { locale: string; id: string };
  searchParams: { coupon?: string };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  const community = await getCommunityDetails(params.id, locale);
  if (!community) notFound();

  return (
    <div className="container-page py-12">
      <CommunityCheckoutView
        community={community}
        locale={locale}
        dict={dict}
        initialCouponCode={searchParams.coupon}
      />
    </div>
  );
}
