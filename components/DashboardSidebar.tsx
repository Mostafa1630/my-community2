"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

export interface SidebarItem {
  href: string;
  label: string;
  // Pre-rendered icon element (e.g. <LayoutDashboard size={16} />), NOT a component
  // reference. This file is a Client Component, and its parent layouts are Server
  // Components — passing an un-rendered component/function across that boundary
  // is not serializable and throws at runtime. Passing an already-created element
  // works fine because React elements are serializable across the RSC boundary.
  icon: ReactNode;
}

export default function DashboardSidebar({ title, items }: { title: string; items: SidebarItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnScroll = () => setOpen(false);
    window.addEventListener("scroll", closeOnScroll, { passive: true });
    return () => window.removeEventListener("scroll", closeOnScroll);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const navList = (onNavigate?: () => void) => (
    <nav className="flex flex-col gap-1.5">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active ? "bg-accent-500 text-ink shadow-card" : "text-white/65 hover:bg-white/10 hover:text-white"
            }`}
          >
            {item.icon}
            <span className="whitespace-nowrap">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile: menu button that opens an off-canvas sidebar */}
      <div className="lg:hidden">
        <button
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm font-medium text-ink shadow-card"
        >
          <Menu size={18} />
          {title}
        </button>
      </div>

      <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-ink/40"
            onClick={() => setOpen(false)}
          />
          <motion.aside
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-0 start-0 flex h-full w-72 max-w-[85%] flex-col gap-4 overflow-y-auto bg-gradient-to-br from-primary-500 to-primary-700 p-4 shadow-raised"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/60">{title}</p>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:bg-white/10"
                aria-label="close"
              >
                <X size={16} />
              </button>
            </div>
            {navList(() => setOpen(false))}
          </motion.aside>
        </div>
      )}
      </AnimatePresence>

      {/* Desktop: pinned in place within the normal page column (so it stays aligned with the
          site's centered container/logo), stays put while the page content scrolls. */}
      <aside className="relative hidden shrink-0 overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 p-4 shadow-raised lg:sticky lg:top-24 lg:block lg:w-64 lg:self-start">
        <div className="pointer-events-none absolute -end-8 -top-8 h-40 w-40 rounded-full bg-accent-400/20 blur-2xl" />
        <p className="relative mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-white/60">{title}</p>
        <div className="relative">{navList()}</div>
      </aside>
    </>
  );
}
