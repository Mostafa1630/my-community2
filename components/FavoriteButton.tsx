"use client";

import { Heart } from "lucide-react";
import type { FavoritableType } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

export default function FavoriteButton({
  favoritableType,
  favoritableId,
  className
}: {
  favoritableType: FavoritableType;
  favoritableId: string;
  className?: string;
}) {
  const { user, isFavorited, toggleFavorite } = useAuth();
  if (!user) return null;

  const active = isFavorited(favoritableType, favoritableId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(favoritableType, favoritableId);
      }}
      aria-label="favorite"
      aria-pressed={active}
      className={
        className ??
        `flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/55`
      }
    >
      <Heart size={15} className={active ? "fill-danger text-danger" : ""} />
    </button>
  );
}
