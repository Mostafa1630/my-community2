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
//
// The arrows are real flex siblings of the scroll track (not absolutely positioned
// overlays) — that's deliberate: an overlay anchored to the wrapper's own edges only
// looks symmetric if the wrapper's width happens to exactly match the visible cards'
// combined width, which isn't guaranteed (leftover space when the items don't perfectly
// tile the container reads as "one arrow hugging the content, the other far away").
// Flex siblings sit at the row's true edges by construction, so the gap on both sides
// is equal no matter how the items happen to divide up the available width.
//
// viewport amount is "some" (any intersection), not a fraction like 0.6 — some callers
// deliberately size items so only ~half a card peeks in at the scroll-snap rest position
// (e.g. the mobile 1-and-a-half-card layout). A fractional threshold like 0.6 would never
// be satisfied by a card that's only ever ~50% visible, so it would sit stuck at its
// `initial` opacity: 0 forever — visually indistinguishable from "the card isn't there."
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
    <div className="flex items-center gap-2">
      {/* Arrows are desktop-only (hidden below sm:) with a bold solid-fill hover state. */}
      <button
        type="button"
        onClick={() => scroll(-1)}
        aria-label="previous"
        className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink/70 shadow-raised transition hover:border-primary-500 hover:bg-primary-500 hover:text-white sm:flex"
      >
        <ChevronLeft size={18} className="rtl:hidden" />
        <ChevronRight size={18} className="hidden rtl:block" />
      </button>

      <div
        ref={trackRef}
        className="scrollbar-hide flex flex-1 snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth py-1"
      >
        {items.map((item, i) => (
          <motion.div
            key={i}
            className={`h-full shrink-0 snap-start ${itemClassName}`}
            initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ root: trackRef, once: false, amount: "some" }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {item}
          </motion.div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scroll(1)}
        aria-label="next"
        className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink/70 shadow-raised transition hover:border-primary-500 hover:bg-primary-500 hover:text-white sm:flex"
      >
        <ChevronRight size={18} className="rtl:hidden" />
        <ChevronLeft size={18} className="hidden rtl:block" />
      </button>
    </div>
  );
}
