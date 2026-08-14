import {
  Bell,
  BookOpen,
  CircleCheck,
  CreditCard,
  GraduationCap,
  PlayCircle,
  Sparkles,
  Star,
  UserPlus,
  Users,
  Wallet,
  type LucideIcon
} from "lucide-react";

const NOTIFICATION_ICON_MAP: Record<string, LucideIcon> = {
  "book-open": BookOpen,
  "play-circle": PlayCircle,
  "circle-check": CircleCheck,
  "user-plus": UserPlus,
  users: Users,
  "credit-card": CreditCard,
  wallet: Wallet,
  star: Star,
  bell: Bell,
  "graduation-cap": GraduationCap
};

const NOTIFICATION_SHELL_MAP: Record<string, string> = {
  "book-open": "bg-primary-100 text-primary-700",
  "play-circle": "bg-accent-100 text-accent-700",
  "circle-check": "bg-success/10 text-success",
  "user-plus": "bg-primary-100 text-primary-700",
  users: "bg-primary-100 text-primary-700",
  "credit-card": "bg-success/10 text-success",
  wallet: "bg-success/10 text-success",
  star: "bg-accent-100 text-accent-700",
  bell: "bg-ink/5 text-ink/55",
  "graduation-cap": "bg-primary-100 text-primary-700"
};

export function resolveNotificationIcon(key: string): LucideIcon {
  return NOTIFICATION_ICON_MAP[key] ?? Sparkles;
}

export function notificationIconShell(key: string): string {
  return NOTIFICATION_SHELL_MAP[key] ?? "bg-ink/5 text-ink/55";
}

export function isNotificationIconUrl(icon: string): boolean {
  return icon.startsWith("http://") || icon.startsWith("https://") || icon.startsWith("/");
}
