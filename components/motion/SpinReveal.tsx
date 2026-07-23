"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// A photo that fades and scales up gently into place once, as it scrolls into view —
// deliberately simple, no rotation (rotation was tried and explicitly rejected by the
// client for every image in the app).
export default function SpinReveal({
  image,
  alt,
  title,
  body,
  icon
}: {
  image: string;
  alt: string;
  title: string;
  body: string;
  icon: ReactNode;
}) {
  return (
    <div className="container-page flex flex-col items-center gap-8 sm:flex-row sm:gap-10">
      <motion.div
        className="w-full max-w-[240px] shrink-0 sm:max-w-[260px]"
        initial={{ opacity: 0, scale: 0.85 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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
