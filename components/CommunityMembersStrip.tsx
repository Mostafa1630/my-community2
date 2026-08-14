"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { CommunitySubscriber } from "@/lib/api-types";
import { useAuth } from "@/lib/auth-context";

const subscribersCache = new Map<string, CommunitySubscriber[]>();
const STORAGE_PREFIX = "mujtamaaty.communitySubscribers.v1:";

function cacheKey(communityId: string, locale: Locale) {
  return `${communityId}:${locale}`;
}

function readStoredSubscribers(key: string): CommunitySubscriber[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CommunitySubscriber[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredSubscribers(key: string, items: CommunitySubscriber[]) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(items));
  } catch {
    // Quota/private mode — in-memory cache still helps within the session.
  }
}

function resolveCachedSubscribers(key: string): CommunitySubscriber[] {
  const mem = subscribersCache.get(key);
  if (mem && mem.length > 0) return mem;
  const stored = readStoredSubscribers(key);
  if (stored.length > 0) subscribersCache.set(key, stored);
  return stored;
}

export default function CommunityMembersStrip({
  communityId,
  locale,
  dict,
  title,
}: {
  communityId: string;
  locale: Locale;
  dict: Dictionary;
  title?: string;
}) {
  const { getCommunitySubscribers } = useAuth();
  const key = cacheKey(communityId, locale);
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState<CommunitySubscriber[]>([]);

  useEffect(() => {
    let cancelled = false;
    const existing = resolveCachedSubscribers(key);
    if (existing.length > 0) {
      setSubscribers(existing);
      setLoading(false);
    }
    getCommunitySubscribers(communityId, locale, 1)
      .then((res) => {
        if (cancelled) return;
        if (res.items.length > 0) {
          subscribersCache.set(key, res.items);
          writeStoredSubscribers(key, res.items);
          setSubscribers(res.items);
        } else if (existing.length === 0) {
          setSubscribers([]);
        }
      })
      .catch(() => {
        // Keep whatever was already on screen — a refresh blip must not wipe members.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [communityId, locale, key, getCommunitySubscribers]);

  const showSkeleton = loading && subscribers.length === 0;

  if (!showSkeleton && subscribers.length === 0) return null;
  if (showSkeleton) {
    return (
      <section className="rounded-xl border border-line bg-surface px-4 py-4">
        <div className="mb-3 h-3 w-28 animate-pulse rounded bg-line/70" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex w-[4.25rem] shrink-0 flex-col items-center gap-2">
              <div className="h-14 w-14 animate-pulse rounded-full bg-line/70" />
              <div className="h-2 w-10 animate-pulse rounded bg-line/60" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-line bg-surface px-4 py-4">
      <h2 className="mb-3 text-xs font-semibold text-ink/55">
        {title ?? dict.creatorDash.activeMembersTitle}
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {subscribers.map((s, index) => (
          <div
            key={`${s.id}-${index}`}
            className="flex w-[4.25rem] shrink-0 flex-col items-center gap-1.5"
          >
            <div className="rounded-full p-[2px] ring-1 ring-line">
              <img
                src={s.profileImage || "/images/avatar-placeholder.jpg"}
                alt=""
                className="h-14 w-14 rounded-full object-cover"
              />
            </div>

            <span className="w-full truncate text-center text-[11px] font-medium text-ink">
              {s.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
