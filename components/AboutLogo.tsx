"use client";

import { useState } from "react";
import Seal from "./Seal";

// A settings-provided logo URL isn't guaranteed to actually load (seen live:
// the real backend can return a localhost-only dev URL) — a failed <img>
// renders the browser's small broken-image glyph in a corner regardless of
// the container's own size, which reads as "the logo is broken" rather than
// "there's no logo yet". Falls back to the site seal mark instead, which
// always fills its circle cleanly either way.
export default function AboutLogo({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <Seal size={56} label={alt[0]} />;
  }

  return <img src={src} alt={alt} onError={() => setFailed(true)} className="h-full w-full object-cover" />;
}
