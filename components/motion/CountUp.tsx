"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

// Counts up from `from` to `to` once, when it scrolls into view — used for the hero's
// floating "10,000+" stat so it reads as a live, growing number rather than static text.
// Always formatted with English digits/commas regardless of locale, matching how this
// stat was already hardcoded in Latin numerals before this animation existed.
export default function CountUp({
  from = 0,
  to,
  duration = 1.6,
  suffix = ""
}: {
  from?: number;
  to: number;
  duration?: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [value, setValue] = useState(from);

  useEffect(() => {
    if (!inView) return;
    let raf: number;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (to - from) * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, from, to, duration]);

  return (
    <span ref={ref}>
      {value.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}
