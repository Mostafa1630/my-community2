import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getCourseDetails } from "@/lib/api-content";
import CourseCheckoutView from "@/components/CourseCheckoutView";

export async function generateMetadata({
  params
}: {
  params: { locale: string; id: string };
}): Promise<Metadata> {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return { title: dict.courseDetails.checkoutTitle, robots: { index: false } };
}

export default async function CourseCheckoutPage({
  params,
  searchParams
}: {
  params: { locale: string; id: string };
  searchParams: { coupon?: string };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  const course = await getCourseDetails(params.id, locale);
  if (!course) notFound();

  return (
    <div className="container-page py-12">
      <CourseCheckoutView course={course} locale={locale} dict={dict} initialCouponCode={searchParams.coupon} />
    </div>
  );
}
