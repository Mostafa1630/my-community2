"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import type { FavoritableType } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";
import { useAuth } from "@/lib/auth-context";

export default function FavoriteButton({
  favoritableType,
  favoritableId,
  locale,
  className
}: {
  favoritableType: FavoritableType;
  favoritableId: string;
  locale: Locale;
  className?: string;
}) {
  const { user, isFavorited, toggleFavorite } = useAuth();
  const [pending, setPending] = useState(false);
  if (!user) return null;

  const active = isFavorited(favoritableType, favoritableId);

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      disabled={pending}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setPending(true);
        try {
          await toggleFavorite(favoritableType, favoritableId, locale);
        } finally {
          setPending(false);
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
        animate={active ? { scale: [1, 1.35, 1] } : { scale: 1 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      >
        <Heart size={15} className={active ? "fill-danger text-danger" : ""} />
      </motion.span>
    </motion.button>
  );
}
