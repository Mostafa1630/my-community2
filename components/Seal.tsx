"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import { getSiteName } from "@/lib/platform-branding";

export default function Seal({
  size = 40,
  dict,
  variant = "default",
  layout = "default"
}: {
  size?: number;
  label?: string;
  tone?: "primary" | "accent";
  dict?: Dictionary;
  /** Use `onDark` in the footer so a text fallback stays readable. */
  variant?: "default" | "onDark";
  /** `inline` aligns the logo with sibling text (e.g. footer blurb). */
  layout?: "default" | "inline" | "footer";
}) {
  const { settings } = useAuth();
  const [failed, setFailed] = useState(false);
  const siteName = dict ? getSiteName(settings, dict) : settings?.siteName?.trim() || "";
  const logoUrl = settings?.siteLogo?.trim();
  const activeUrl = logoUrl;

  useEffect(() => {
    setFailed(false);
  }, [activeUrl]);

  if (activeUrl && !failed) {
    return (
      <img
        src={activeUrl}
        alt={siteName || "Platform"}
        style={{ height: size, width: "auto" }}
        className={
          layout === "footer"
            ? "block max-w-[140px] object-contain"
            : layout === "inline"
              ? "block max-w-full object-contain"
              : "shrink-0 object-contain"
        }
        onError={() => setFailed(true)}
      />
    );
  }

  if (layout === "footer") {
    return (
      <span
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-xs font-bold text-white"
        aria-label={siteName || "Platform"}
      >
        {(siteName || "P").charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <span
      className={`block text-start font-extrabold tracking-tight ${variant === "onDark" ? "text-white" : "text-primary-600"}`}
      style={{ fontSize: Math.round(size * 0.38), lineHeight: 1 }}
      aria-label={siteName || "Platform"}
    >
      {siteName || "Platform"}
    </span>
  );
}
