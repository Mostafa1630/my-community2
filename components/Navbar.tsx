"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  ChevronDown,
  Heart,
  Home,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
  Users,
  UsersRound,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import { initials } from "@/lib/accents";
import { setStoredLocale } from "@/lib/locale-storage";
import Seal from "./Seal";
import NotificationBell from "./NotificationBell";

type NavLink = { href: string; label: string; icon: LucideIcon };

function NavMenuItem({
  href,
  label,
  icon: Icon,
  active,
  onClick,
  danger,
  compact
}: {
  href?: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  onClick: () => void;
  danger?: boolean;
  compact?: boolean;
}) {
  const className = compact
    ? `group relative flex shrink-0 items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-primary-500/10 text-primary-700"
          : danger
            ? "text-danger hover:bg-danger/10"
            : "text-ink/70 hover:bg-ink/[0.04] hover:text-ink"
      }`
    : `group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-primary-500/10 text-primary-700"
          : danger
            ? "text-danger hover:bg-danger/10"
            : "text-ink/80 hover:bg-ink/[0.04]"
      }`;

  const iconShellClass = compact
    ? `flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
        active
          ? "bg-primary-500 text-white shadow-sm"
          : danger
            ? "bg-danger/10 text-danger"
            : "bg-ink/[0.05] text-ink/50 group-hover:bg-primary-50 group-hover:text-primary-600"
      }`
    : `flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
        active
          ? "bg-primary-500 text-white shadow-sm"
          : danger
            ? "bg-danger/10 text-danger"
            : "bg-ink/[0.05] text-ink/50 group-hover:bg-primary-50 group-hover:text-primary-600"
      }`;

  const content = (
    <>
      {!compact && active && (
        <span className="absolute inset-y-2.5 start-0 w-1 rounded-full bg-primary-500" aria-hidden="true" />
      )}
      <span className={iconShellClass}>
        <Icon size={compact ? 16 : 18} strokeWidth={2} />
      </span>
      <span className={compact ? "whitespace-nowrap" : "flex-1 text-start"}>{label}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

export default function Navbar({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const closeOnScroll = () => setMobileOpen(false);
    window.addEventListener("scroll", closeOnScroll, { passive: true });
    return () => window.removeEventListener("scroll", closeOnScroll);
  }, [mobileOpen]);

  const pathWithoutLocale = pathname.replace(/^\/(ar|en)/, "") || "/";
  const profileHref = role === "creator" ? `/${locale}/creator/profile` : `/${locale}/profile`;

  const navLinks: NavLink[] = [
    { href: `/${locale}`, label: dict.nav.home, icon: Home },
    { href: `/${locale}/creators`, label: dict.nav.creators, icon: Users }
  ];
  if (role === "student") {
    navLinks.push({ href: `/${locale}/my-communities`, label: dict.nav.myCommunities, icon: UsersRound });
    navLinks.push({ href: `/${locale}/my-courses`, label: dict.nav.myCoursesLink, icon: BookOpen });
  }
  if (role === "student" || role === "creator") {
    navLinks.push({ href: `/${locale}/favorites`, label: dict.nav.favorites, icon: Heart });
  }
const closeMobileMenu = () => setMobileOpen(false);
const closeAccountMenu = () => setRoleMenuOpen(false);

const roleLabel =
  role && role in dict.roles
    ? dict.roles[role as keyof typeof dict.roles]
    : dict.roles.guest;

const userSubtitle = role === "student" && user?.email
  ? user.email
    : roleLabel;
  
  return (
    <header className="sticky top-0 z-40 overflow-x-clip border-b border-line bg-paper/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4 !ps-0 sm:!ps-1 lg:!ps-2">
        <a href={`/${locale}`} className="flex shrink-0 items-center max-lg:-ms-2">
          <Seal size={46} dict={dict} />
        </a>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex">
          {navLinks.map((link) => (
            <NavMenuItem
              key={link.href}
              href={link.href}
              label={link.label}
              icon={link.icon}
              active={pathname === link.href}
              onClick={() => undefined}
              compact
            />
          ))}
          {role === "creator" && (
            <NavMenuItem
              href={`/${locale}/creator/dashboard`}
              label={dict.nav.creatorPanel}
              icon={LayoutDashboard}
              active={pathname.startsWith(`/${locale}/creator/`)}
              onClick={() => undefined}
              compact
            />
          )}
        </nav>

        <div className="flex items-center gap-2">
          <div
            className="flex items-center rounded-full border border-line p-0.5 text-xs font-semibold"
            role="group"
            aria-label={dict.common.language}
          >
            <Link
              href={`/ar${pathWithoutLocale}`}
              onClick={() => setStoredLocale("ar")}
              className={`rounded-full px-2 py-1 transition ${
                locale === "ar" ? "bg-primary-500 text-white" : "text-ink/65 hover:text-primary-700"
              }`}
              aria-current={locale === "ar" ? "true" : undefined}
            >
              AR
            </Link>
            <Link
              href={`/en${pathWithoutLocale}`}
              onClick={() => setStoredLocale("en")}
              className={`rounded-full px-2 py-1 transition ${
                locale === "en" ? "bg-primary-500 text-white" : "text-ink/65 hover:text-primary-700"
              }`}
              aria-current={locale === "en" ? "true" : undefined}
            >
              EN
            </Link>
          </div>

          {user && <NotificationBell locale={locale} dict={dict} />}

          {user ? (
            <div className="relative hidden lg:block">
              <button
                onClick={() => setRoleMenuOpen((v) => !v)}
                className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-sm font-medium transition ${
                  roleMenuOpen
                    ? "border-primary-200 bg-primary-500/10 text-primary-700"
                    : "border-line text-ink/70 hover:border-primary-300 hover:text-primary-700"
                }`}
              >
                {user.profileImage ? (
                  <img src={user.profileImage} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">
                    {initials(user.name)}
                  </span>
                )}
                <span className="max-w-[8rem] truncate">{user.name.split(" ")[0]}</span>
                <ChevronDown size={14} className={`transition ${roleMenuOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {roleMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -4 }}
                    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute end-0 top-[calc(100%+0.5rem)] w-80 rounded-2xl border border-line bg-surface p-3 shadow-raised"
                    onMouseLeave={closeAccountMenu}
                  >
                    <div className="mb-3 flex items-center gap-3 rounded-2xl border border-line bg-gradient-to-br from-primary-500/[0.08] to-transparent p-3">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt="" className="h-11 w-11 rounded-full object-cover ring-2 ring-white" />
                      ) : (
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-white ring-2 ring-white">
                          {initials(user.name)}
                        </span>
                      )}
                      <div className="min-w-0 text-start">
                        <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                        <p className="truncate text-xs text-ink/50" dir={role === "student" ? "ltr" : undefined}>
                          {userSubtitle}
                        </p>
                      </div>
                    </div>
                    <p className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wider text-ink/40">{dict.nav.account}</p>
                    <div className="flex flex-col gap-0.5">
                      <NavMenuItem
                        href={profileHref}
                        label={dict.nav.profile}
                        icon={UserRound}
                        active={pathname === profileHref}
                        onClick={closeAccountMenu}
                      />
                      <NavMenuItem
                        href={`/${locale}/change-password`}
                        label={dict.nav.changePasswordLink}
                        icon={KeyRound}
                        active={pathname === `/${locale}/change-password`}
                        onClick={closeAccountMenu}
                      />
                      <NavMenuItem
                        label={dict.nav.logout}
                        icon={LogOut}
                        danger
                        onClick={() => {
                          logout(locale);
                          closeAccountMenu();
                          router.push(`/${locale}`);
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <Link
                href={`/${locale}/login`}
                className="rounded-full border border-line px-3.5 py-1.5 text-sm font-medium text-ink/70 hover:border-primary-300 hover:text-primary-700"
              >
                {dict.nav.login}
              </Link>
              <Link
                href={`/${locale}/register`}
                className="rounded-full bg-primary-500 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-primary-600"
              >
                {dict.nav.register}
              </Link>
            </div>
          )}

          <button
            className="rounded-full border border-line p-2 lg:hidden max-lg:me-2"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
      {mobileOpen && (
        <>
          <motion.button
            type="button"
            aria-label={dict.common.close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-16 z-30 bg-ink/30 lg:hidden"
            onClick={closeMobileMenu}
          />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 top-full z-50 max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-line bg-surface shadow-raised lg:hidden"
          >
            <div className="container-page py-4">
              {user && (
                <div className="mb-4 flex items-center gap-3 rounded-2xl border border-line bg-gradient-to-br from-primary-500/[0.08] to-transparent p-3">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="" className="h-11 w-11 rounded-full object-cover ring-2 ring-white" />
                  ) : (
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-white ring-2 ring-white">
                      {initials(user.name)}
                    </span>
                  )}
                  <div className="min-w-0 text-start">
                    <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                    <p className="truncate text-xs text-ink/50" dir={role === "student" ? "ltr" : undefined}>
                      {userSubtitle}
                    </p>
                  </div>
                </div>
              )}

              <nav className="flex flex-col gap-0.5" aria-label={dict.nav.home}>
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 + index * 0.035, duration: 0.2 }}
                  >
                    <NavMenuItem
                      href={link.href}
                      label={link.label}
                      icon={link.icon}
                      active={pathname === link.href}
                      onClick={closeMobileMenu}
                    />
                  </motion.div>
                ))}
                {role === "creator" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 + navLinks.length * 0.035, duration: 0.2 }}
                  >
                    <NavMenuItem
                      href={`/${locale}/creator/dashboard`}
                      label={dict.nav.creatorPanel}
                      icon={LayoutDashboard}
                      active={pathname.startsWith(`/${locale}/creator/`)}
                      onClick={closeMobileMenu}
                    />
                  </motion.div>
                )}
              </nav>

              <div className="my-3 h-px bg-line" />

              {user ? (
                <div>
                  <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-ink/40">{dict.nav.account}</p>
                  <div className="flex flex-col gap-0.5">
                    <NavMenuItem
                      href={profileHref}
                      label={dict.nav.profile}
                      icon={UserRound}
                      active={pathname === profileHref}
                      onClick={closeMobileMenu}
                    />
                    <NavMenuItem
                      href={`/${locale}/change-password`}
                      label={dict.nav.changePasswordLink}
                      icon={KeyRound}
                      active={pathname === `/${locale}/change-password`}
                      onClick={closeMobileMenu}
                    />
                    <NavMenuItem
                      label={dict.nav.logout}
                      icon={LogOut}
                      danger
                      onClick={() => {
                        logout(locale);
                        closeMobileMenu();
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 px-1">
                  <Link
                    href={`/${locale}/login`}
                    onClick={closeMobileMenu}
                    className="rounded-xl bg-primary-500 py-3 text-center text-sm font-semibold text-white shadow-raised transition hover:bg-primary-600"
                  >
                    {dict.nav.login}
                  </Link>
                  <Link
                    href={`/${locale}/register`}
                    onClick={closeMobileMenu}
                    className="rounded-xl border border-line bg-paper py-3 text-center text-sm font-semibold text-ink transition hover:border-primary-200 hover:bg-primary-50/40"
                  >
                    {dict.nav.register}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
      </AnimatePresence>
    </header>
  );
}
