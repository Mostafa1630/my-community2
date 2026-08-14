import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getCourseDetails } from "@/lib/api-content";
import { withDecryptedIntroVideo } from "@/lib/video";
import CourseCheckoutView from "@/components/CourseCheckoutView";

export async function generateMetadata(
  props: {
    params: Promise<{ locale: string; id: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  return { title: dict.courseDetails.checkoutTitle, robots: { index: false } };
}

export default async function CourseCheckoutPage(
  props: {
    params: Promise<{ locale: string; id: string }>;
    searchParams: Promise<{ coupon?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  const rawCourse = await getCourseDetails(params.id, locale);
  if (!rawCourse) notFound();
  const course = await withDecryptedIntroVideo(rawCourse);

  return (
    <div className="container-page py-12">
      <CourseCheckoutView course={course} locale={locale} dict={dict} initialCouponCode={searchParams.coupon} />
    </div>
  );
}
