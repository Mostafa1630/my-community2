"use client";

import { useEffect, useRef, useState } from "react";

function TypewriterLine({
  text,
  start,
  speed = 30,
  onComplete
}: {
  text: string;
  start: boolean;
  speed?: number;
  onComplete?: () => void;
}) {
  const [display, setDisplay] = useState("");
  const [done, setDone] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!start) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setDisplay(text);
      setDone(true);
      onCompleteRef.current?.();
      return;
    }

    const chars = [...text];
    let index = 0;
    setDisplay("");
    setDone(false);

    const intervalId = window.setInterval(() => {
      index += 1;
      setDisplay(chars.slice(0, index).join(""));

      if (index >= chars.length) {
        window.clearInterval(intervalId);
        setDone(true);
        onCompleteRef.current?.();
      }
    }, speed);

    return () => window.clearInterval(intervalId);
  }, [text, start, speed]);

  return (
    <>
      {display}
      {!done && (
        <span
          className="ms-0.5 inline-block h-[0.85em] w-0.5 animate-pulse bg-primary-500 align-middle"
          aria-hidden="true"
        />
      )}
    </>
  );
}

export default function HeroCopy({
  siteName,
  headline,
  subtitle
}: {
  siteName: string;
  headline: string;
  subtitle: string;
}) {
  const [nameDone, setNameDone] = useState(false);
  const [headlineDone, setHeadlineDone] = useState(false);

  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-700">
        <TypewriterLine text={siteName} start speed={22} onComplete={() => setNameDone(true)} />
      </p>

      <h1 className="mt-3 text-2xl font-bold leading-snug text-ink sm:text-3xl sm:leading-[1.3] lg:text-[2.25rem]">
        <span className="sr-only">{headline}</span>
        <span aria-hidden="true">
          <TypewriterLine
            text={headline}
            start={nameDone}
            speed={28}
            onComplete={() => setHeadlineDone(true)}
          />
        </span>
      </h1>

      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-ink/65 sm:text-[0.9375rem] sm:leading-[1.65]">
        <span className="sr-only">{subtitle}</span>
        <span aria-hidden="true">
          <TypewriterLine
            text={subtitle}
            start={headlineDone}
            speed={20}
          />
        </span>
      </p>
    </>
  );
}
