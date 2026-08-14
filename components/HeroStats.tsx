"use client";

import { useEffect, useRef, useState } from "react";

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function Counter({
  value,
  locale,
  delay = 0
}: {
  value: number;
  locale: string;
  delay?: number;
}) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (value <= 0) {
      setCount(0);
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setCount(value);
      return;
    }

    const duration = Math.min(2000, 900 + value * 6);
    let startTime: number | null = null;

    const tick = (now: number) => {
      if (startTime === null) startTime = now;
      const elapsed = now - startTime - delay;

      if (elapsed < 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.round(easeOutCubic(progress) * value));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, locale, delay]);

  return <>{count.toLocaleString(locale)}</>;
}

export default function HeroStats({
  stats,
  locale
}: {
  stats: { value: number; label: string }[];
  locale: string;
}) {
  return (
    <div className="mx-auto mt-8 inline-flex divide-x divide-line rounded-2xl border border-line bg-surface shadow-card">
      {stats.map((stat, index) => (
        <div key={stat.label} className="px-6 py-4 text-center sm:px-8">
          <p
            className="font-mono text-xl font-bold tabular-nums text-primary-700 sm:text-2xl"
            aria-label={stat.value.toLocaleString(locale)}
          >
            <Counter value={stat.value} locale={locale} delay={index * 120} />
          </p>
          <p className="mt-0.5 text-xs text-ink/55">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
