"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// A simple, no-rotation entrance for the hero photo — fades and scales up into place
// on mount. The hero's motion "moment" now belongs to the CTA buttons sliding in
// (see HeroButtons.tsx) instead of the image spinning.
export default function HeroImageReveal({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
