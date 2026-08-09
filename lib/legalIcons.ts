import {
  AlertTriangle,
  Ban,
  BookOpen,
  ClipboardList,
  Cookie,
  CreditCard,
  Database,
  FileQuestion,
  FileText,
  Gavel,
  Lock,
  Mail,
  Scale,
  Settings2,
  Share2,
  User,
  type LucideIcon
} from "lucide-react";

// Maps the string `icon` key GET /legal-sections/{type} returns per section
// to an actual lucide component — falls back to a generic icon for any key
// the backend introduces later that isn't in this list yet, rather than
// crashing the page.
const LEGAL_ICON_MAP: Record<string, LucideIcon> = {
  "book-open": BookOpen,
  user: User,
  "clipboard-list": ClipboardList,
  "credit-card": CreditCard,
  scale: Scale,
  ban: Ban,
  "alert-triangle": AlertTriangle,
  gavel: Gavel,
  mail: Mail,
  "file-text": FileText,
  database: Database,
  settings: Settings2,
  "share-2": Share2,
  lock: Lock,
  cookie: Cookie
};

export function resolveLegalIcon(key: string): LucideIcon {
  return LEGAL_ICON_MAP[key] ?? FileQuestion;
}
