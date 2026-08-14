"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import type { FavoritableType } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";
import { useAuth } from "@/lib/auth-context";

const PLACEHOLDER_CLASS =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/20 backdrop-blur";

export default function FavoriteButton({
  favoritableType,
  favoritableId,
  locale,
  className,
  initialIsFavorite,
  fetchStatusIfNeeded = false,
  onChange,
}: {
  favoritableType: FavoritableType;
  favoritableId: string;
  locale: Locale;
  className?: string;
  initialIsFavorite?: boolean;
  fetchStatusIfNeeded?: boolean;
  onChange?: (isFavorite: boolean) => void;
}) {
  const { user, sessionReady, toggleFavorite, fetchCommunityDetails, fetchCourseDetails } = useAuth();
  const [pending, setPending] = useState(false);
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean | undefined>(initialIsFavorite);
  const [statusLoading, setStatusLoading] = useState(
    () => initialIsFavorite === undefined && fetchStatusIfNeeded,
  );

  useEffect(() => {
    setIsFavorite(initialIsFavorite);
    if (initialIsFavorite !== undefined) {
      setStatusLoading(false);
    }
  }, [initialIsFavorite]);

  useEffect(() => {
    if (!fetchStatusIfNeeded || !user || initialIsFavorite !== undefined) return;
    let cancelled = false;
    setStatusLoading(true);
    (async () => {
      const details =
        favoritableType === "community"
          ? await fetchCommunityDetails(favoritableId, locale)
          : await fetchCourseDetails(favoritableId, locale);
      if (!cancelled) {
        if (details?.isFavorite !== undefined) {
          setIsFavorite(details.isFavorite);
        }
        setStatusLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    fetchStatusIfNeeded,
    user,
    initialIsFavorite,
    favoritableType,
    favoritableId,
    locale,
    fetchCommunityDetails,
    fetchCourseDetails,
  ]);

  const statusUnknown = user && optimistic === null && statusLoading;

  if (sessionReady && !user) return null;

  if (!sessionReady || statusUnknown) {
    return <span className={className ?? PLACEHOLDER_CLASS} aria-hidden />;
  }

  const active = optimistic ?? isFavorite ?? false;

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      disabled={pending}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setOptimistic(!active);
        setPending(true);
        try {
          const nowFavorited = await toggleFavorite(favoritableType, favoritableId, locale);
          setIsFavorite(nowFavorited);
          onChange?.(nowFavorited);
        } catch {
          setOptimistic(null);
        } finally {
          setPending(false);
          setOptimistic(null);
        }
      }}
      aria-label="favorite"
      aria-pressed={active}
      className={
        className ??
        `flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/55`
      }
    >
      <motion.span
        className="flex"
        animate={optimistic !== null && active ? { scale: [1, 1.35, 1] } : { scale: 1 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      >
        <Heart size={15} className={active ? "fill-danger text-danger" : ""} />
      </motion.span>
    </motion.button>
  );
}
