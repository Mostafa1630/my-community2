"use client";

import { useRef, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Horizontal scroll-snap carousel with prev/next arrows and a punchy "pop in"
// entrance per item (scale + slight rotation settling with an overshoot ease —
// reads as a bouncy, alive reveal rather than the calmer fade used for plain
// grids elsewhere, per the client's explicit ask for flashier motion here).
//
// Deliberately never animates opacity (only scale/rotate) — see Reveal.tsx's
// comment for the full story, but in short: an opacity:0 initial state makes
// Chrome's Largest Contentful Paint algorithm treat the element as if it were
// never painted at all, which measurably broke LCP reporting entirely for any
// page where this slider's items sat above the fold (confirmed both via
// Lighthouse and a raw PerformanceObserver — fixed by dropping opacity from
// the animated properties, keeping scale/rotate for the same bouncy feel).
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
// `initial` scale/rotate forever — visually indistinguishable from "the card isn't there."
//
// The scale delta was originally 0.8→1 (a full 20% size swing) but a screenshot caught
// two cards mid-transition next to each other — one already popped to full size, one
// still at its smaller `initial` scale — reading as "these cards are different sizes,"
// not as a reveal in progress. Toned down to 0.94→1 so the effect is still visible but
// two cards caught at different points of the transition no longer look mismatched.
//
// `min-w-0` on each item wrapper matters more than it looks: a flex item's default
// min-width is `auto`, meaning the browser won't shrink it below its content's own
// intrinsic width even when an explicit width class is set — so a card with a longer
// title/bio (or a locale where the same string happens to render wider, e.g. switching
// to Arabic) could silently render WIDER than its `itemClassName` width while a card
// with shorter text rendered at the intended size, making cards in the same row visibly
// uneven widths (and, as a side effect, uneven gaps between them). `min-w-0` overrides
// that default so every card is genuinely locked to the same computed width regardless
// of its content, and text wraps/clips inside instead of pushing the box wider.
export default function Slider({
  items,
  itemClassName = "w-[46%] sm:w-[31%] lg:w-[18%]",
  animateIn = true,
  centered = false,
}: {
  items: ReactNode[];
  itemClassName?: string;
  // The pop-in reveal is skipped for sliders whose first row sits above the
  // fold on load (the home page's very first section) — those items are
  // already in the viewport before any JS/IntersectionObserver has run, so
  // starting them at opacity:0 doesn't read as a reveal, it just delays the
  // page's actual Largest Contentful Paint (measured: this alone was enough
  // to make Lighthouse unable to detect any LCP element on the home page at
  // all — NO_LCP — while every other page measured normally).
  animateIn?: boolean;
  // Swaps the scroll-snap alignment from the default (each card's start edge
  // snaps to the track's start edge) to centered. Deliberately NOT paired
  // with side padding on the track — padding would sit in view at rest
  // (scrollLeft can't go negative to "reveal" it for the first item), reading
  // as dead empty space before the first card ever loads. Without padding,
  // the browser just clamps: item 1's snap-center target computes negative
  // and clamps to 0, so it naturally sits flush at the start showing a
  // generous peek of item 2 (no wasted space) — then item 2 onward centers
  // for real, using the actual neighboring cards' own content (scrolled
  // partway off-screen) as the peek, not padding. Opt-in since most callers
  // actually want the plain start-aligned layout.
  centered?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scroll(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const rtl = getComputedStyle(track).direction === "rtl";
    track.scrollBy({
      left: track.clientWidth * 0.85 * (rtl ? -direction : direction),
      behavior: "smooth",
    });
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
        className={`scrollbar-hide flex flex-1 snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth py-1 ${
          centered ? "px-[16.67%]" : ""
        }`}
      >
        {items.map((item, i) =>
          animateIn ? (
            <motion.div
              key={i}
              className={`flex min-w-0 self-stretch shrink-0 ${centered ? "snap-center" : "snap-start"} ${itemClassName}`}
              initial={{ scale: 0.96 }}
              whileInView={{ scale: 1 }}
              viewport={{ root: trackRef, once: false, amount: "some" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {item}
            </motion.div>
          ) : (
            <div
              key={i}
              className={`flex min-w-0 self-stretch shrink-0 ${centered ? "snap-center" : "snap-start"} ${itemClassName}`}
            >
              {item}
            </div>
          ),
        )}
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
