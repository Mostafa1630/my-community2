"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// A premium "tilt + spin + settle" entrance for the hero photo — a 3D flip (rotateY,
// needs the `perspective` on the wrapper to actually read as 3D rather than a flat
// squash) and a scale/fade-in that both play once on mount, plus a full **double**
// rotation that keeps looping forever afterward (spin, 5s pause, spin again) — the
// client wants this specific image to stay visibly alive, not settle into stillness
// like the calmer single-spin-once Privacy/Terms images (see SpinReveal.tsx).
export default function HeroImageReveal({ children }: { children: ReactNode }) {
  return (
    <div style={{ perspective: 1200 }}>
      <motion.div
        initial={{ opacity: 0, rotateY: -65, rotate: 0, scale: 0.8 }}
        animate={{ opacity: 1, rotateY: 0, rotate: 720, scale: 1 }}
        transition={{
          opacity: { duration: 1, ease: [0.16, 1, 0.3, 1] },
          rotateY: { duration: 1, ease: [0.16, 1, 0.3, 1] },
          scale: { duration: 1, ease: [0.16, 1, 0.3, 1] },
          rotate: { duration: 1.8, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
