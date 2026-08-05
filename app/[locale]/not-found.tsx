import Link from "next/link";
import { Compass } from "lucide-react";
import { defaultLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";

export default function NotFound() {
  // Locale params aren't passed to not-found boundaries, so we render with the
  // platform's default locale here; the rest of the app is fully localized.
  const locale = defaultLocale;
  const dict = getDictionary(locale);

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600">
        <Compass size={24} />
      </span>
      <h1 className="text-2xl font-bold text-ink">404</h1>
      <p className="mt-2 max-w-sm text-sm text-ink/65">
        {locale === "ar" ? "الصفحة اللي بتدور عليها مش موجودة." : "We couldn't find the page you're looking for."}
      </p>
      <Link href={`/${locale}`} className="mt-6 rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white">
        {dict.common.backHome}
      </Link>
    </div>
  );
}
