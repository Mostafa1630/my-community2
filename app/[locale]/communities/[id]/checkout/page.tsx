import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getCommunityDetails } from "@/lib/api-content";
import CommunityCheckoutView from "@/components/CommunityCheckoutView";

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string; id: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return { title: dict.communityDetails.checkoutTitle, robots: { index: false } };
}

export default async function CommunityCheckoutPage(
  props: {
    params: Promise<{ locale: string; id: string }>;
    searchParams: Promise<{ coupon?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
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
