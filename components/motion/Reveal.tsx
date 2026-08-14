"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";


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
