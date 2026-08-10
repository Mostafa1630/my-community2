"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ZoomIn } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import Modal from "./motion/Modal";

// Bigger window to actually judge a crop by, especially the wide 3:1 cover
// shape — at the old fixed 320px width that rendered barely 107px tall,
// too cramped to see what was actually being kept. Sized per shape rather
// than one fixed constant: the circle avatar window grows modestly (it was
// already reasonably readable), the rect cover window grows a lot more
// since it's the one that was genuinely too small.
const AVATAR_CONTAINER_SIZE = 380;
const COVER_CONTAINER_WIDTH = 600;

// Facebook-style "drag to reposition, pinch/slide to zoom" picker — not a
// freeform crop tool. The container is a fixed-size window (circle for
// avatars, a 3:1 rectangle for covers); the image is always scaled to fully
// cover it (like CSS object-fit: cover) and can only be panned/zoomed
// within that constraint, so there's never an empty gap to accidentally
// upload. The backend only ever receives a single image file — no crop
// coordinates field exists in the API — so the crop has to actually happen
// client-side: what you see in the window is rendered to a canvas and
// exported as the real file that gets uploaded.
export default function ImageCropper({
  file,
  aspect,
  shape,
  outputSize,
  dict,
  onConfirm,
  onCancel
}: {
  file: File;
  // width / height, e.g. 1 for a square avatar, 3 for a 1200×400 cover.
  aspect: number;
  shape: "circle" | "rect";
  outputSize: { width: number; height: number };
  dict: Dictionary;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const imgElRef = useRef<HTMLImageElement | null>(null);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const draggingRef = useRef<{ startX: number; startY: number; startOffsetX: number; startOffsetY: number } | null>(null);

  const containerWidth = shape === "circle" ? AVATAR_CONTAINER_SIZE : COVER_CONTAINER_WIDTH;
  const containerHeight = containerWidth / aspect;

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImgSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleImageLoad() {
    const el = imgElRef.current;
    if (!el) return;
    setNaturalSize({ width: el.naturalWidth, height: el.naturalHeight });
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }

  const baseScale =
    naturalSize.width > 0
      ? Math.max(containerWidth / naturalSize.width, containerHeight / naturalSize.height)
      : 1;
  const scale = baseScale * zoom;
  const displayWidth = naturalSize.width * scale;
  const displayHeight = naturalSize.height * scale;

  function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
  }

  function clampOffset(x: number, y: number) {
    const minX = containerWidth - displayWidth;
    const minY = containerHeight - displayHeight;
    return { x: clamp(x, minX, 0), y: clamp(y, minY, 0) };
  }

  function onPointerDown(e: React.PointerEvent) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    draggingRef.current = { startX: e.clientX, startY: e.clientY, startOffsetX: offset.x, startOffsetY: offset.y };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!draggingRef.current) return;
    const dx = e.clientX - draggingRef.current.startX;
    const dy = e.clientY - draggingRef.current.startY;
    setOffset(clampOffset(draggingRef.current.startOffsetX + dx, draggingRef.current.startOffsetY + dy));
  }

  function onPointerUp() {
    draggingRef.current = null;
  }

  function handleZoomChange(next: number) {
    setZoom(next);
    // Re-clamp against the new (larger/smaller) display size so the pan
    // offset never leaves a gap after zooming.
    const newScale = baseScale * next;
    const newW = naturalSize.width * newScale;
    const newH = naturalSize.height * newScale;
    const minX = containerWidth - newW;
    const minY = containerHeight - newH;
    setOffset((prev) => ({ x: clamp(prev.x, minX, 0), y: clamp(prev.y, minY, 0) }));
  }

  function handleConfirm() {
    const el = imgElRef.current;
    if (!el) return;
    const canvas = document.createElement("canvas");
    canvas.width = outputSize.width;
    canvas.height = outputSize.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // What's visible inside the container window, translated back into the
    // original image's own pixel coordinates.
    const sx = -offset.x / scale;
    const sy = -offset.y / scale;
    const sw = containerWidth / scale;
    const sh = containerHeight / scale;
    ctx.drawImage(el, sx, sy, sw, sh, 0, 0, outputSize.width, outputSize.height);

    canvas.toBlob(
      (blob) => {
        if (blob) onConfirm(blob);
      },
      "image/jpeg",
      0.92
    );
  }

  return (
    <Modal open onClose={onCancel} maxWidth={shape === "circle" ? "max-w-md" : "max-w-2xl"}>
      <h3 className="mb-4 text-base font-bold text-ink">{dict.common.repositionImage}</h3>

      <div
        className="relative mx-auto touch-none overflow-hidden bg-ink/10"
        style={{
          width: containerWidth,
          height: containerHeight,
          borderRadius: shape === "circle" ? "9999px" : "1rem",
          cursor: draggingRef.current ? "grabbing" : "grab"
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {imgSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imgElRef}
            src={imgSrc}
            alt=""
            draggable={false}
            onLoad={handleImageLoad}
            className="pointer-events-none absolute select-none"
            style={{
              width: displayWidth || "auto",
              height: displayHeight || "auto",
              left: offset.x,
              top: offset.y,
              maxWidth: "none"
            }}
          />
        )}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <ZoomIn size={16} className="shrink-0 text-ink/50" />
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => handleZoomChange(Number(e.target.value))}
          className="w-full accent-primary-500"
        />
      </div>

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-full border border-line py-2.5 text-sm font-medium text-ink/70"
        >
          {dict.common.cancel}
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary-500 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
        >
          <Check size={15} />
          {dict.common.save}
        </button>
      </div>
    </Modal>
  );
}
