"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// The two hero CTAs slide in from opposite physical sides (left / right — not
// logical start/end, matching the hero section's existing deliberate physical
// left-right layout that's already forced regardless of locale) into their resting
// position, instead of the hero photo carrying the motion — see HeroImageReveal.tsx.
export default function HeroButtons({ primary, secondary }: { primary: ReactNode; secondary: ReactNode }) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {primary}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {secondary}
      </motion.div>
    </div>
  );
}
