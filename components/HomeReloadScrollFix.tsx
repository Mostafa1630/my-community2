"use client";

import { useEffect } from "react";

export default function HomeReloadScrollFix() {
  useEffect(() => {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (nav?.type !== "reload") return;

    if (window.location.hash === "#communities") {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    window.scrollTo(0, 0);
  }, []);

  return null;
}
