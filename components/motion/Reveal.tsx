"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// Slides a block in from alternating sides (even index from the start/left, odd from the
// end/right) as it scrolls into view — slow and calm on purpose, a deliberate contrast to
// Slider's punchy pop-in, per the client's explicit ask for a slower, more "impressive"
// feel on plain card grids that don't have a slider of their own.
export default function Reveal({
  children,
  index = 0,
  className
}: {
  children: ReactNode;
  index?: number;
  className?: string;
}) {
  const fromStart = index % 2 === 0;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: fromStart ? -48 : 48 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.9, delay: Math.min(index, 10) * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
