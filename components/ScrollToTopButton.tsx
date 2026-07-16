"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="scroll to top"
      className="fixed bottom-6 end-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-primary-500 text-white shadow-raised transition hover:bg-primary-600"
    >
      <ArrowUp size={18} />
    </button>
  );
}
