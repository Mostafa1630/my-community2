"use client";

import { useRef, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Horizontal scroll-snap carousel with prev/next arrows and a punchy "pop in"
// entrance per item (fade + scale + slight rotation settling with an overshoot
// ease — reads as a bouncy, alive reveal rather than the calmer fade used for
// plain grids elsewhere, per the client's explicit ask for flashier motion here).
//
// The reveal is rooted to the slider's own scroll track (not the page viewport),
// with `once: false` — so it isn't a one-time-ever animation, it replays every
// time an item scrolls into view *within the slider*, including scrolling back
// to an item you already passed. That's what makes clicking the arrows back and
// forth keep re-triggering the pop, per the client's explicit ask.
export default function Slider({
  items,
  itemClassName = "w-[46%] sm:w-[31%] lg:w-[18%]"
}: {
  items: ReactNode[];
  itemClassName?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scroll(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const rtl = getComputedStyle(track).direction === "rtl";
    track.scrollBy({ left: track.clientWidth * 0.85 * (rtl ? -direction : direction), behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth py-1"
      >
        {items.map((item, i) => (
          <motion.div
            key={i}
            className={`h-full shrink-0 snap-start ${itemClassName}`}
            initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ root: trackRef, once: false, amount: 0.6 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {item}
          </motion.div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scroll(-1)}
        aria-label="previous"
        className="absolute start-0 top-1/2 z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface text-ink/70 shadow-raised transition hover:bg-primary-50 hover:text-primary-700 rtl:translate-x-1/2"
      >
        <ChevronLeft size={18} className="rtl:hidden" />
        <ChevronRight size={18} className="hidden rtl:block" />
      </button>
      <button
        type="button"
        onClick={() => scroll(1)}
        aria-label="next"
        className="absolute end-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-line bg-surface text-ink/70 shadow-raised transition hover:bg-primary-50 hover:text-primary-700 rtl:-translate-x-1/2"
      >
        <ChevronRight size={18} className="rtl:hidden" />
        <ChevronLeft size={18} className="hidden rtl:block" />
      </button>
    </div>
  );
}
