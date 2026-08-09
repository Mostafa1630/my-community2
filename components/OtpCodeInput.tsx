"use client";

import { useRef } from "react";

const LENGTH = 5;

// 5 separate boxes rather than one text input — matches the "code shown
// nicely" ask, with auto-advance on type/backspace and paste support for
// pasting the whole code from the email at once.
export default function OtpCodeInput({
  value,
  onChange,
  error,
  disabled
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? "");

  function setDigit(index: number, digit: string) {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join(""));
  }

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    setDigit(index, digit);
    if (digit && index < LENGTH - 1) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted.padEnd(LENGTH, "").slice(0, LENGTH).trimEnd());
    const focusIndex = Math.min(pasted.length, LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  }

  return (
    <div>
      <div className="flex items-center justify-center gap-2.5" dir="ltr">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={`h-14 w-12 rounded-xl border bg-paper text-center text-xl font-bold text-ink outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 disabled:opacity-60 ${
              error ? "border-danger" : "border-line"
            }`}
          />
        ))}
      </div>
      {error && <p className="mt-2 text-center text-xs text-danger">{error}</p>}
    </div>
  );
}
