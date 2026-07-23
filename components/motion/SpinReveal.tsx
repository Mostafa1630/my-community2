"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// A photo that fades + scales into place once (when it scrolls into view), then keeps
// doing one full, smooth rotation on a loop forever — a spin, a 5s pause, a spin again
// — per the client's explicit ask for continuous motion, not a one-time reveal. Rotating
// to 360 (rather than a keyframe array) and letting `repeat: Infinity` restart from the
// 0 initial value works because 0deg and 360deg are visually identical, so the loop
// restart is invisible; only the fade/scale are one-shot (`once: true` on the viewport).
export default function SpinReveal({
  image,
  alt,
  title,
  body,
  icon,
  reverse = false
}: {
  image: string;
  alt: string;
  title: string;
  body: string;
  icon: ReactNode;
  reverse?: boolean;
}) {
  return (
    <div
      className={`container-page flex flex-col items-center gap-8 sm:gap-10 ${
        reverse ? "sm:flex-row-reverse" : "sm:flex-row"
      }`}
    >
      <motion.div
        className="w-full max-w-[240px] shrink-0 sm:max-w-[260px]"
        initial={{ opacity: 0, rotate: 0, scale: 0.7 }}
        whileInView={{ opacity: 1, rotate: 360, scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{
          opacity: { duration: 1, ease: [0.16, 1, 0.3, 1] },
          scale: { duration: 1, ease: [0.16, 1, 0.3, 1] },
          rotate: { duration: 1.4, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }
        }}
      >
        <img
          src={image}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="aspect-square w-full rounded-3xl border border-line object-cover shadow-raised"
        />
      </motion.div>

      <div className="flex flex-col items-center text-center sm:items-start sm:text-start">
        <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          {icon}
        </span>
        <h2 className="text-lg font-bold text-ink sm:text-xl">{title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/60">{body}</p>
      </div>
    </div>
  );
}
