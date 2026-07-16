import {
  LayoutDashboard,
  BookOpen,
  Wallet,
  Landmark,
  Users2,
  MessageSquare,
  Tag,
  UserRound
} from "lucide-react";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import DashboardSidebar, { type SidebarItem } from "@/components/DashboardSidebar";
import RoleGuard from "@/components/RoleGuard";

export default function CreatorLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = getDictionary(locale);
  const base = `/${locale}/creator`;

  // Icons are rendered here (in a Server Component) into plain React elements before
  // being handed to <DashboardSidebar>, which is a Client Component. Passing an
  // un-rendered icon *component reference* across that boundary is not serializable
  // and crashes at runtime — passing an already-rendered element is fine.
  const items: SidebarItem[] = [
    { href: `${base}/dashboard`, label: dict.creatorDash.dashboard, icon: <LayoutDashboard size={16} /> },
    { href: `${base}/community`, label: dict.creatorDash.myCommunity, icon: <Users2 size={16} /> },
    { href: `${base}/courses`, label: dict.creatorDash.myCourses, icon: <BookOpen size={16} /> },
    { href: `${base}/earnings`, label: dict.creatorDash.earnings, icon: <Wallet size={16} /> },
    { href: `${base}/withdrawals`, label: dict.creatorDash.withdrawals, icon: <Landmark size={16} /> },
    { href: `${base}/coupons`, label: dict.creatorDash.couponsTitle, icon: <Tag size={16} /> },
    { href: `${base}/community/feed`, label: dict.creatorDash.communityFeed, icon: <MessageSquare size={16} /> },
    { href: `${base}/profile`, label: dict.creatorDash.profile, icon: <UserRound size={16} /> }
  ];

  return (
    <RoleGuard
      allow="creator"
      locale={locale}
      message={
        locale === "ar"
          ? 'لوحة منشئ المحتوى متاحة لأصحاب حساب "منشئ محتوى" فقط. استخدم "معاينة كـ" في القائمة العلوية للدخول كمنشئ محتوى تجريبي.'
          : 'The content creator panel is only for "content creator" accounts. Use "Preview as" in the top navbar to sign in as a demo content creator.'
      }
    >
      <div className="container-page flex flex-col gap-8 py-10 lg:flex-row">
        <DashboardSidebar title={dict.creatorDash.panelTitle} items={items} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </RoleGuard>
  );
}
