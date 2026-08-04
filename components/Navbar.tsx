"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  Globe,
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  UserRound
} from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import { initials } from "@/lib/accents";
import Seal from "./Seal";

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

  const otherLocale: Locale = locale === "ar" ? "en" : "ar";
  const pathWithoutLocale = pathname.replace(/^\/(ar|en)/, "") || "/";
  const switchHref = `/${otherLocale}${pathWithoutLocale}`;
  const profileHref = role === "creator" ? `/${locale}/creator/profile` : `/${locale}/profile`;

  const navLinks = [
    { href: `/${locale}`, label: dict.nav.home },
    { href: `/${locale}/creators`, label: dict.nav.creators }
  ];
  if (role === "student") {
    navLinks.push({ href: `/${locale}/my-communities`, label: dict.nav.myCommunities });
  }
  if (role === "student" || role === "creator") {
    navLinks.push({ href: `/${locale}/favorites`, label: dict.nav.favorites });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href={`/${locale}`} className="flex items-center gap-2 shrink-0">
          <Seal size={36} label={dict.meta.siteName[0]} />
          <span className="font-display text-lg font-bold text-ink">{dict.meta.siteName}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-ink/70 transition hover:bg-primary-50 hover:text-primary-700"
            >
              {link.label}
            </Link>
          ))}
          {role === "creator" && (
            <Link
              href={`/${locale}/creator/dashboard`}
              className="flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700"
            >
              <LayoutDashboard size={16} />
              {dict.nav.creatorPanel}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={switchHref}
            className="flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-sm font-medium text-ink/70 hover:border-primary-300 hover:text-primary-700"
            aria-label={dict.common.language}
          >
            <Globe size={15} />
            {otherLocale === "ar" ? "عربي" : "English"}
          </Link>

          <div className="relative hidden sm:block">
            <button
              onClick={() => setRoleMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm font-medium text-ink/70 hover:border-primary-300 hover:text-primary-700"
            >
              {user ? (
                user.profileImage ? (
                  <img src={user.profileImage} alt="" className="h-5 w-5 rounded-full object-cover" />
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
                    {initials(user.name)}
                  </span>
                )
              ) : (
                <GraduationCap size={15} />
              )}
              {user ? user.name.split(" ")[0] : dict.nav.account}
              <ChevronDown size={14} />
            </button>
            <AnimatePresence>
            {roleMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -4 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="absolute end-0 top-11 w-72 rounded-xl border border-line bg-surface p-2 shadow-raised"
                onMouseLeave={() => setRoleMenuOpen(false)}
              >
                {user ? (
                  <>
                    <Link
                      href={profileHref}
                      onClick={() => setRoleMenuOpen(false)}
                      className="flex w-full items-center gap-1.5 rounded-lg px-2 py-2 text-start text-sm text-ink/80 hover:bg-primary-50 hover:text-primary-700"
                    >
                      <UserRound size={14} />
                      {dict.nav.profile}
                    </Link>
                    <button
                      onClick={() => {
                        logout(locale);
                        setRoleMenuOpen(false);
                        router.push(`/${locale}`);
                      }}
                      className="flex w-full items-center gap-1.5 rounded-lg px-2 py-2 text-start text-sm text-danger hover:bg-danger/10"
                    >
                      <LogOut size={14} />
                      {dict.nav.logout}
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 px-2 pt-1">
                    <Link
                      href={`/${locale}/login`}
                      className="flex-1 whitespace-nowrap rounded-lg bg-primary-500 px-1.5 py-2 text-center text-sm font-medium text-white"
                      onClick={() => setRoleMenuOpen(false)}
                    >
                      {dict.nav.login}
                    </Link>
                    <Link
                      href={`/${locale}/register`}
                      className="flex-1 whitespace-nowrap rounded-lg border border-line px-1.5 py-2 text-center text-sm font-medium text-ink"
                      onClick={() => setRoleMenuOpen(false)}
                    >
                      {dict.nav.register}
                    </Link>
                  </div>
                )}
              </motion.div>
            )}
            </AnimatePresence>
          </div>

          <button
            className="rounded-full border border-line p-2 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-x-0 top-full max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-line bg-surface shadow-raised lg:hidden"
        >
          <div className="container-page flex flex-col gap-1 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink/80 hover:bg-primary-50"
              >
                {link.label}
              </Link>
            ))}
            {role === "creator" && (
              <Link
                href={`/${locale}/creator/dashboard`}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50"
              >
                {dict.nav.creatorPanel}
              </Link>
            )}
            <div className="my-1 border-t border-line" />
            {user ? (
              <>
                <Link
                  href={profileHref}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-ink/80 hover:bg-primary-50"
                >
                  {dict.nav.profile}
                </Link>
                <button
                  onClick={() => {
                    logout(locale);
                    setMobileOpen(false);
                  }}
                  className="rounded-lg px-3 py-2 text-start text-sm text-danger hover:bg-danger/10"
                >
                  {dict.nav.logout}
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-3 pt-1">
                <Link
                  href={`/${locale}/login`}
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 whitespace-nowrap rounded-lg bg-primary-500 px-1.5 py-2 text-center text-sm font-medium text-white"
                >
                  {dict.nav.login}
                </Link>
                <Link
                  href={`/${locale}/register`}
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 whitespace-nowrap rounded-lg border border-line px-1.5 py-2 text-center text-sm font-medium text-ink"
                >
                  {dict.nav.register}
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </header>
  );
}
