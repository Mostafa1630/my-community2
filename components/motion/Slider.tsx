"use client";

import { useRef, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";


export default function Slider({
  items,
  itemClassName = "w-[46%] sm:w-[31%] lg:w-[18%]",
  animateIn = true,
  centered = false,
}: {
  items: ReactNode[];
  itemClassName?: string;

  animateIn?: boolean;

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
        className={
          "scrollbar-hide flex flex-1 snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth py-1"
        }
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
