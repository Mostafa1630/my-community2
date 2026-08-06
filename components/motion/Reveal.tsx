"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// Slides a block in from alternating sides (even index from the start/left, odd from the
// end/right) as it scrolls into view. An earlier round asked for this to be slow and
// dramatic; a later round asked to calm it back down, so the distance, duration, and
// per-item stagger are all toned down from that original request.
//
// `animate=false` renders a plain div instead of a motion.div — used for grids that sit
// above (or just below) the fold on load. Measured directly, with a raw PerformanceObserver
// and confirmed independently via Lighthouse: a framer-motion `motion.div` using
// `whileInView` on the page's initial card grid was enough on its own to make Chrome
// never report ANY Largest Contentful Paint candidate for the whole page (NO_LCP) — not
// just opacity:0 (which hides the element outright), but even an x-only slide with no
// opacity change at all. Disabling reduced-motion at the OS level (which makes Framer
// Motion skip the animation) fixed it immediately, and a side-by-side test with these
// items rendered as plain divs confirmed the same fix without relying on the user's OS
// setting. Root cause not fully pinned down beyond "framer-motion's whileInView tracking
// interferes with Chrome's paint-stability heuristic for LCP" — the practical fix is
// simply not animating grids that render as part of the initial page load.
export default function Reveal({
  children,
  index = 0,
  className,
  animate = true
}: {
  children: ReactNode;
  index?: number;
  className?: string;
  animate?: boolean;
}) {
  const fromStart = index % 2 === 0;
  if (!animate) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      initial={{ x: fromStart ? -20 : 20 }}
      whileInView={{ x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index, 10) * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
