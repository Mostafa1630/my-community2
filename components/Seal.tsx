"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

// Site logo — sourced from GET /settings (site_logo) everywhere on the site,
// falling back to the bundled static mark while settings hasn't loaded yet,
// if the backend has no logo set, or if the returned URL fails to load (seen
// live: a backend can return a dev-only localhost URL nothing else can reach).
const FALLBACK_SRC = "/images/nadi-logo2.png";

export default function Seal({ size = 40 }: { size?: number; label?: string; tone?: "primary" | "accent" }) {
  const { settings } = useAuth();
  const [failed, setFailed] = useState(false);
  const isFallback = failed || !settings?.siteLogo;
  const src = isFallback ? FALLBACK_SRC : settings!.siteLogo!;

  return (
    <img
      src={src}
      alt="Nadi Community"
      style={{
        height: size,
        width: "auto",
        // Only the bundled fallback mark has a wide transparent margin baked
        // into its leading side (the icon square starts well past the
        // image's own left edge) — pulled back with a negative margin so its
        // visible start lines up with sibling text/elements instead of
        // reading as indented. An admin-uploaded logo from settings has no
        // such known padding, so it renders at its own natural bounds
        // instead of guessing at a crop that only fits one specific image.
        marginInlineStart: isFallback ? -(size * 0.5) : 0
      }}
      className="shrink-0 object-contain"
      onError={() => setFailed(true)}
    />
  );
}
