"use client";

import { useState } from "react";
import type { ReactionType } from "@/lib/api-types";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { REACTION_TYPES, REACTION_EMOJI, REACTION_COLOR, reactionLabel } from "./reactionConfig";

// Click = fast-path love/unlove (works everywhere, including touch); hover
// (desktop only) reveals the full 6-reaction bar for a deliberate choice —
// same two-tier interaction Facebook's own reaction button uses.
export default function ReactionPicker({
  current,
  onReact,
  onRemove,
  dict
}: {
  current: ReactionType | null;
  onReact: (type: ReactionType) => void;
  onRemove: () => void;
  dict: Dictionary;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onClick={() => (current ? onRemove() : onReact("love"))}
        className={`flex items-center gap-1.5 text-sm font-medium transition ${
          current ? REACTION_COLOR[current] : "text-ink/65 hover:text-primary-700"
        }`}
      >
        <span className="text-base leading-none">{current ? REACTION_EMOJI[current] : "🤍"}</span>
        {current ? reactionLabel(current, dict) : dict.community.reactAction}
      </button>

      {open && (
        <div className="absolute bottom-full start-0 z-10 mb-1.5 flex items-center gap-0.5 rounded-full border border-line bg-surface p-1.5 shadow-raised">
          {REACTION_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              title={reactionLabel(type, dict)}
              onClick={() => {
                onReact(type);
                setOpen(false);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full text-xl transition hover:scale-125"
            >
              {REACTION_EMOJI[type]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
