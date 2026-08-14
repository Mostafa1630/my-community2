"use client";

import { useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";
import type { ReactionType } from "@/lib/api-types";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { REACTION_TYPES, REACTION_EMOJI, REACTION_COLOR, reactionLabel } from "./reactionConfig";

const LONG_PRESS_MS = 450;


export default function ReactionPicker({
  current,
  onReact,
  onRemove,
  dict,
  iconOnly = false,
}: {
  current: ReactionType | null;
  onReact: (type: ReactionType) => void | Promise<void>;
  onRemove: () => void | Promise<void>;
  dict: Dictionary;
  iconOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressOpenedRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  function clearLongPressTimer() {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }

  function handlePointerDown() {
    clearLongPressTimer();
    longPressOpenedRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      longPressOpenedRef.current = true;
      setOpen(true);
      longPressTimerRef.current = null;
    }, LONG_PRESS_MS);
  }

  function handlePointerUp() {
    clearLongPressTimer();
  }

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (longPressOpenedRef.current) {
      longPressOpenedRef.current = false;
      return;
    }
    void (current ? onRemove() : onReact("love"));
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative" onMouseEnter={() => setOpen(true)}>
      <button
        type="button"
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`flex items-center transition ${
          iconOnly
            ? `rounded-full p-2 ${
                current
                  ? current === "love"
                    ? "text-danger hover:bg-red-50"
                    : "text-ink/70 hover:bg-paper hover:text-ink"
                  : "text-ink/70 hover:bg-paper hover:text-ink"
              }`
            : `gap-1.5 text-sm font-medium ${current ? REACTION_COLOR[current] : "text-ink/65 hover:text-primary-700"}`
        }`}
        aria-label={current ? reactionLabel(current, dict) : dict.community.reactAction}
        aria-expanded={open}
      >
        {iconOnly ? (
          current && current !== "love" ? (
            <span className="text-[1.375rem] leading-none">{REACTION_EMOJI[current]}</span>
          ) : (
            <Heart
              size={22}
              strokeWidth={1.75}
              fill={current === "love" ? "currentColor" : "none"}
              className={current === "love" ? "text-danger" : undefined}
            />
          )
        ) : (
          <>
            <span className="text-base leading-none">
              {current ? REACTION_EMOJI[current] : "🤍"}
            </span>
            {current ? reactionLabel(current, dict) : dict.community.reactAction}
          </>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full start-0 z-20 pb-1.5">
          <div className="flex items-center gap-0.5 rounded-full border border-line bg-surface p-1.5 shadow-raised">
            {REACTION_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                title={reactionLabel(type, dict)}
                onClick={(e) => {
                  e.stopPropagation();
                  void onReact(type);
                  setOpen(false);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-xl transition hover:scale-125"
              >
                {REACTION_EMOJI[type]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
