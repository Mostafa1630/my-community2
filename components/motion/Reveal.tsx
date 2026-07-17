"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// Fades + slides a block into place once it scrolls into view. `index` staggers
// siblings in a grid/list so items don't all pop in at once — pass the map index.
export default function Reveal({
  children,
  index = 0,
  className
}: {
  children: ReactNode;
  index?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index, 8) * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
