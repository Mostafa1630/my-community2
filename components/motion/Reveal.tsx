"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// Slides a block in from alternating sides (even index from the start/left, odd from the
// end/right) as it scrolls into view. An earlier round asked for this to be slow and
// dramatic; this round explicitly asked to calm it back down, so the distance, duration,
// and per-item stagger are all toned down from that original request.
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
      initial={{ opacity: 0, x: fromStart ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index, 10) * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
