"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, BookOpen, CheckCheck, CircleCheck, Loader2, PlayCircle, Sparkles } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import type { AppNotification } from "@/lib/api-types";
import { formatRelative } from "@/lib/format";
import { isNotificationIconUrl, notificationIconShell, resolveNotificationIcon } from "@/lib/notificationIcons";

function isPaymentNotification(n: AppNotification) {
  const text = `${n.message ?? ""} ${n.type}`.toLowerCase();
  return /دفع|payment|paid|subscribe|subscription|اشتراك|نجاح|success|enrolled|تمت/.test(text);
}

type NotificationVisual =
  | { kind: "lucide"; Icon: typeof Sparkles; shell: string }
  | { kind: "image"; src: string; shell: string };

function notificationVisual(n: AppNotification): NotificationVisual {
  if (n.icon) {
    if (isNotificationIconUrl(n.icon)) {
      return { kind: "image", src: n.icon, shell: "bg-ink/5" };
    }
    return { kind: "lucide", Icon: resolveNotificationIcon(n.icon), shell: notificationIconShell(n.icon) };
  }
  if (isPaymentNotification(n)) {
    return { kind: "lucide", Icon: CircleCheck, shell: "bg-success/10 text-success" };
  }
  if (n.type === "new_course_in_community") {
    return { kind: "lucide", Icon: BookOpen, shell: "bg-primary-100 text-primary-700" };
  }
  if (n.type === "new_lesson_in_course") {
    return { kind: "lucide", Icon: PlayCircle, shell: "bg-accent-100 text-accent-700" };
  }
  return { kind: "lucide", Icon: Sparkles, shell: "bg-ink/5 text-ink/55" };
}

export default function NotificationBell({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const router = useRouter();
  const { unreadNotificationsCount, refreshUnreadNotificationsCount, getNotifications, markNotificationRead, markAllNotificationsRead } =
    useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open || loaded) return;
    setLoading(true);
    getNotifications(locale, 1)
      .then((res) => {
        setItems(res.items);
        setLoaded(true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, loaded, locale, getNotifications]);

  function notificationHref(n: AppNotification) {
    if (n.courseId) return `/${locale}/courses/${n.courseId}`;
    if (n.communityId) return `/${locale}/communities/${n.communityId}`;
    return null;
  }

  function notificationText(n: AppNotification) {
    if (n.message) return n.message;
    return n.type === "new_course_in_community" ? dict.notifications.newCourseFallback : dict.notifications.newLessonFallback;
  }

  function handleClick(n: AppNotification) {
    if (!n.read) {
      setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, read: true } : i)));
      markNotificationRead(n.id, locale).catch(() => {});
    }
    setOpen(false);
    const href = notificationHref(n);
    if (href) router.push(href);
  }

  async function handleMarkAll() {
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    try {
      await markAllNotificationsRead(locale);
    } catch {
      refreshUnreadNotificationsCount(locale);
    }
  }

  const hasUnreadInList = items.some((i) => !i.read);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={dict.notifications.title}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink/70 transition hover:border-primary-300 hover:text-primary-700"
      >
        <Bell size={17} />
        {unreadNotificationsCount > 0 && (
          <span className="absolute -end-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {unreadNotificationsCount > 99 ? "99+" : unreadNotificationsCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-3 top-16 z-50 max-h-[calc(100vh-5rem)] overflow-hidden rounded-xl border border-line bg-surface shadow-raised sm:absolute sm:inset-x-auto sm:end-0 sm:top-11 sm:max-h-none sm:w-[22rem] sm:max-w-[90vw]"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="text-sm font-bold text-ink">{dict.notifications.title}</p>
              {hasUnreadInList && (
                <button
                  onClick={handleMarkAll}
                  className="flex items-center gap-1 text-xs font-semibold text-primary-700 hover:text-primary-800"
                >
                  <CheckCheck size={13} />
                  {dict.notifications.markAllRead}
                </button>
              )}
            </div>

            <div className="max-h-[26rem] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size={18} className="animate-spin text-ink/40" />
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <Bell size={22} className="text-ink/30" />
                  <p className="text-xs text-ink/55">{dict.notifications.empty}</p>
                </div>
              ) : (
                <ul>
                  {items.map((n) => {
                    const visual = notificationVisual(n);
                    return (
                    <li key={n.id}>
                      <button
                        onClick={() => handleClick(n)}
                        className={`flex w-full items-center gap-3 border-b border-line/60 px-4 py-3 text-start transition last:border-0 hover:bg-primary-50/60 ${
                          !n.read ? "bg-primary-50/40" : ""
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl ${visual.shell}`}
                        >
                          {visual.kind === "image" ? (
                            <img src={visual.src} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <visual.Icon size={16} strokeWidth={2} />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block text-sm leading-5 ${!n.read ? "font-semibold text-ink" : "text-ink/75"}`}>
                            {notificationText(n)}
                          </span>
                          <span className="mt-0.5 block text-[11px] text-ink/45">{formatRelative(n.createdAt, locale)}</span>
                        </span>
                        {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary-500" />}
                      </button>
                    </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
