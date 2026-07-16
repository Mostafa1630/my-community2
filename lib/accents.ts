import type { AccentKey } from "./types";

interface AccentStyle {
  gradient: string;
  solid: string;
  text: string;
  ring: string;
}

export const accentMap: Record<AccentKey, AccentStyle> = {
  teal: {
    gradient: "from-primary-700 via-primary-500 to-primary-400",
    solid: "bg-primary-500",
    text: "text-primary-700",
    ring: "ring-primary-300"
  },
  gold: {
    gradient: "from-accent-700 via-accent-500 to-accent-300",
    solid: "bg-accent-500",
    text: "text-accent-700",
    ring: "ring-accent-300"
  },
  clay: {
    gradient: "from-[#7A3B2E] via-[#B4573F] to-[#E39066]",
    solid: "bg-[#B4573F]",
    text: "text-[#7A3B2E]",
    ring: "ring-[#E39066]"
  },
  ink: {
    gradient: "from-[#10231F] via-[#1D3A34] to-[#3F5C54]",
    solid: "bg-[#1D3A34]",
    text: "text-[#10231F]",
    ring: "ring-[#3F5C54]"
  },
  moss: {
    gradient: "from-[#31432B] via-[#4E6B41] to-[#8AA46F]",
    solid: "bg-[#4E6B41]",
    text: "text-[#31432B]",
    ring: "ring-[#8AA46F]"
  },
  plum: {
    gradient: "from-[#3B2A4A] via-[#5F4373] to-[#9576AE]",
    solid: "bg-[#5F4373]",
    text: "text-[#3B2A4A]",
    ring: "ring-[#9576AE]"
  },
  sand: {
    gradient: "from-[#8A6A3C] via-[#B99459] to-[#E4C48C]",
    solid: "bg-[#B99459]",
    text: "text-[#8A6A3C]",
    ring: "ring-[#E4C48C]"
  },
  rust: {
    gradient: "from-[#6E2E22] via-[#A24230] to-[#CC6B4C]",
    solid: "bg-[#A24230]",
    text: "text-[#6E2E22]",
    ring: "ring-[#CC6B4C]"
  }
};

export function getAccent(accent: AccentKey) {
  return accentMap[accent] ?? accentMap.teal;
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
