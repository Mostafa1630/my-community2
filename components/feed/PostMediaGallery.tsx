"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Download, FileText, Play, X } from "lucide-react";
import type { PostMediaItem } from "@/lib/api-types";
import { postMediaKind } from "@/lib/api-types";

function mediaLabel(item: PostMediaItem): string {
  if (item.name) return item.name;
  try {
    const path = new URL(item.url).pathname;
    return path.split("/").pop() || item.url;
  } catch {
    return item.url.split("/").pop() || item.url;
  }
}

function viewableIndices(items: PostMediaItem[]): number[] {
  return items.reduce<number[]>((acc, item, index) => {
    const kind = postMediaKind(item);
    if (kind === "image" || kind === "video") acc.push(index);
    return acc;
  }, []);
}

function PostMediaLightbox({
  items,
  index,
  onClose,
  onChangeIndex,
}: {
  items: PostMediaItem[];
  index: number;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
}) {
  const item = items[index];
  const kind = postMediaKind(item);
  const indices = viewableIndices(items);
  const position = indices.indexOf(index);
  const hasPrev = position > 0;
  const hasNext = position >= 0 && position < indices.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) onChangeIndex(indices[position - 1]);
  }, [hasPrev, indices, onChangeIndex, position]);

  const goNext = useCallback(() => {
    if (hasNext) onChangeIndex(indices[position + 1]);
  }, [hasNext, indices, onChangeIndex, position]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [goNext, goPrev, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute end-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
        aria-label="Close"
      >
        <X size={22} />
      </button>

      {indices.length > 1 && (
        <>
          {hasPrev && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goPrev();
              }}
              className="absolute start-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 sm:start-5"
              aria-label="Previous"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          {hasNext && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goNext();
              }}
              className="absolute end-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 sm:end-5"
              aria-label="Next"
            >
              <ChevronRight size={24} />
            </button>
          )}
          <p className="absolute bottom-4 start-1/2 z-10 -translate-x-1/2 rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white/90">
            {position + 1} / {indices.length}
          </p>
        </>
      )}

      <div className="max-h-[90vh] max-w-[min(96vw,1200px)]" onClick={(event) => event.stopPropagation()}>
        {kind === "video" ? (
          <video
            key={item.url}
            src={item.url}
            controls
            autoPlay
            playsInline
            className="max-h-[90vh] max-w-[min(96vw,1200px)] rounded-lg bg-black object-contain"
          />
        ) : (
          <img
            src={item.url}
            alt={item.name ?? ""}
            className="max-h-[90vh] max-w-[min(96vw,1200px)] rounded-lg object-contain"
          />
        )}
      </div>
    </div>,
    document.body,
  );
}

function MediaFill({ item, preview = false }: { item: PostMediaItem; preview?: boolean }) {
  const kind = postMediaKind(item);

  if (kind === "video") {
    return (
      <video
        src={item.url}
        controls={!preview}
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
    );
  }

  if (kind === "image") {
    return (
      <img
        src={item.url}
        alt={item.name ?? ""}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
    );
  }

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      download
      className="flex h-full min-h-[4.5rem] items-center gap-3 bg-surface px-4 py-3 text-sm transition hover:bg-paper"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
        <FileText size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-ink">{mediaLabel(item)}</span>
        {item.size && <span className="mt-0.5 block text-xs text-ink/50">{item.size}</span>}
      </span>
      <Download size={15} className="shrink-0 text-ink/45" />
    </a>
  );
}

function MediaCell({
  item,
  className = "",
  overlay,
  onOpen,
}: {
  item: PostMediaItem;
  className?: string;
  overlay?: ReactNode;
  onOpen?: () => void;
}) {
  const kind = postMediaKind(item);
  const isFile = kind === "file";
  const clickable = !isFile && onOpen;

  const inner = (
    <>
      <MediaFill item={item} preview={clickable && kind === "video"} />
      {kind === "video" && clickable && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white">
            <Play size={16} className="ms-0.5 fill-white" />
          </span>
        </span>
      )}
      {overlay}
    </>
  );

  if (isFile) {
    return (
      <div className={`relative min-h-0 overflow-hidden rounded-xl bg-ink/[0.04] ${className}`}>
        <MediaFill item={item} />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();
        onOpen?.();
      }}
      className={`relative block min-h-0 w-full overflow-hidden rounded-xl bg-ink/[0.04] transition hover:brightness-[0.97] ${className}`}
    >
      {inner}
    </button>
  );
}

function SingleMedia({ item, onOpen }: { item: PostMediaItem; onOpen?: () => void }) {
  const kind = postMediaKind(item);

  if (kind === "file") {
    return (
      <div className="border-t border-line bg-surface">
        <MediaFill item={item} />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();
        onOpen?.();
      }}
      className="relative block w-full overflow-hidden rounded-xl bg-ink/[0.04] transition hover:brightness-[0.97]"
    >
      {kind === "video" ? (
        <>
          <video
            src={item.url}
            playsInline
            preload="metadata"
            className="max-h-[500px] w-full object-cover object-center"
          />
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white">
              <Play size={18} className="ms-0.5 fill-white" />
            </span>
          </span>
        </>
      ) : (
        <img
          src={item.url}
          alt={item.name ?? ""}
          loading="lazy"
          decoding="async"
          className="max-h-[500px] w-full object-cover object-center"
        />
      )}
    </button>
  );
}

function MultiMediaGrid({
  items,
  onOpen,
}: {
  items: PostMediaItem[];
  onOpen: (index: number) => void;
}) {
  const count = items.length;

  if (count === 2) {
    return (
      <div className="grid h-[260px] grid-cols-2 gap-2">
        <MediaCell item={items[0]} className="h-full" onOpen={() => onOpen(0)} />
        <MediaCell item={items[1]} className="h-full" onOpen={() => onOpen(1)} />
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="grid h-[340px] grid-cols-2 grid-rows-2 gap-2">
        <MediaCell item={items[0]} className="row-span-2 h-full" onOpen={() => onOpen(0)} />
        <MediaCell item={items[1]} className="h-full" onOpen={() => onOpen(1)} />
        <MediaCell item={items[2]} className="h-full" onOpen={() => onOpen(2)} />
      </div>
    );
  }

  const visible = items.slice(0, 4);
  const extra = items.length - 4;

  return (
    <div className="grid h-[340px] grid-cols-2 grid-rows-2 gap-2">
      {visible.map((item, index) => (
        <MediaCell
          key={`${item.url}-${index}`}
          item={item}
          className="h-full"
          onOpen={() => onOpen(index)}
          overlay={
            index === 3 && extra > 0 ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/55 text-2xl font-bold text-white">
                +{extra}
              </div>
            ) : undefined
          }
        />
      ))}
    </div>
  );
}

export default function PostMediaGallery({
  items,
  variant = "feed",
}: {
  items: PostMediaItem[];
  variant?: "feed" | "card";
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = useCallback(
    (index: number) => {
      const kind = postMediaKind(items[index]);
      if (kind === "image" || kind === "video") setLightboxIndex(index);
    },
    [items],
  );

  if (items.length === 0) return null;

  const isFeed = variant === "feed";
  const shellClass = isFeed
    ? "relative z-10 px-5"
    : "relative z-10 mt-3 overflow-hidden rounded-xl border border-line/80 bg-ink/[0.02] p-2";

  return (
    <>
      <div className={shellClass}>
        {items.length === 1 ? (
          <SingleMedia item={items[0]} onOpen={() => openLightbox(0)} />
        ) : (
          <MultiMediaGrid items={items} onOpen={openLightbox} />
        )}
      </div>

      {lightboxIndex !== null && (
        <PostMediaLightbox
          items={items}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChangeIndex={setLightboxIndex}
        />
      )}
    </>
  );
}
