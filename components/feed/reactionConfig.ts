import type { ReactionType } from "@/lib/api-types";
import type { Dictionary } from "@/lib/i18n/getDictionary";

export const REACTION_TYPES: ReactionType[] = ["like", "love", "haha", "wow", "sad", "angry"];

export const REACTION_EMOJI: Record<ReactionType, string> = {
  like: "\u{1F44D}",
  love: "❤️",
  haha: "\u{1F602}",
  wow: "\u{1F62E}",
  sad: "\u{1F622}",
  angry: "\u{1F620}"
};

export const REACTION_COLOR: Record<ReactionType, string> = {
  like: "text-primary-600",
  love: "text-danger",
  haha: "text-accent-600",
  wow: "text-accent-600",
  sad: "text-ink/60",
  angry: "text-danger"
};

export function reactionLabel(type: ReactionType, dict: Dictionary): string {
  const map: Record<ReactionType, string> = {
    like: dict.community.reactionLike,
    love: dict.community.reactionLove,
    haha: dict.community.reactionHaha,
    wow: dict.community.reactionWow,
    sad: dict.community.reactionSad,
    angry: dict.community.reactionAngry
  };
  return map[type];
}
