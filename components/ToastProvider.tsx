"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, Loader2, X } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

type ToastItem = {
  id: number;
  kind: "message";
  message: string;
  variant: ToastVariant;
  duration: number;
};

type ConfirmItem = {
  id: number;
  kind: "confirm";
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  confirming: boolean;
};

type ToastEntry = ToastItem | ConfirmItem;

type ToastContextValue = {
  showToast: (message: string, options?: { variant?: ToastVariant; duration?: number }) => void;
  confirm: (options: {
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
  }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<
  ToastVariant,
  { accent: string; iconWrap: string; icon: string; progress: string }
> = {
  success: {
    accent: "border-s-success",
    iconWrap: "bg-success/10",
    icon: "text-success",
    progress: "bg-success",
  },
  error: {
    accent: "border-s-danger",
    iconWrap: "bg-danger/10",
    icon: "text-danger",
    progress: "bg-danger",
  },
  info: {
    accent: "border-s-info",
    iconWrap: "bg-info/10",
    icon: "text-info",
    progress: "bg-info",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<ToastEntry[]>([]);
  const idRef = useRef(0);
  const hasConfirm = entries.some((e) => e.kind === "confirm");

  const dismiss = useCallback((id: number) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, options?: { variant?: ToastVariant; duration?: number }) => {
      const id = ++idRef.current;
      setEntries((prev) => [
        ...prev,
        {
          id,
          kind: "message",
          message,
          variant: options?.variant ?? "info",
          duration: options?.duration ?? 4000,
        },
      ]);
    },
    [],
  );

  const confirm = useCallback(
    ({
      message,
      confirmLabel = "OK",
      cancelLabel = "Cancel",
      onConfirm,
      onCancel,
    }: {
      message: string;
      confirmLabel?: string;
      cancelLabel?: string;
      onConfirm: () => void | Promise<void>;
      onCancel?: () => void;
    }) => {
      const id = ++idRef.current;
      setEntries([
        {
          id,
          kind: "confirm",
          message,
          confirmLabel,
          cancelLabel,
          onConfirm,
          onCancel,
          confirming: false,
        },
      ]);
    },
    [],
  );

  async function handleConfirm(entry: ConfirmItem) {
    if (entry.confirming) return;
    setEntries((prev) =>
      prev.map((e) => (e.id === entry.id && e.kind === "confirm" ? { ...e, confirming: true } : e)),
    );
    try {
      await entry.onConfirm();
      dismiss(entry.id);
    } catch {
      setEntries((prev) =>
        prev.map((e) => (e.id === entry.id && e.kind === "confirm" ? { ...e, confirming: false } : e)),
      );
    }
  }

  return (
    <ToastContext.Provider value={{ showToast, confirm }}>
      {children}

      <AnimatePresence>
        {hasConfirm && (
          <motion.div
            key="toast-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[99] bg-ink/25"
            aria-hidden
          />
        )}
      </AnimatePresence>

      <div
        className="pointer-events-none fixed inset-x-0 top-20 z-[100] flex flex-col items-center gap-3 px-4 sm:top-24"
        aria-live="polite"
      >
        <AnimatePresence mode="popLayout">
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="pointer-events-auto w-full max-w-sm"
            >
              {entry.kind === "confirm" ? (
                <ConfirmToast
                  entry={entry}
                  onCancel={() => {
                    entry.onCancel?.();
                    dismiss(entry.id);
                  }}
                  onConfirm={() => void handleConfirm(entry)}
                />
              ) : (
                <MessageToast entry={entry} onDismiss={() => dismiss(entry.id)} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function MessageToast({ entry, onDismiss }: { entry: ToastItem; onDismiss: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, entry.duration);
    return () => window.clearTimeout(timer);
  }, [entry.duration, entry.id, onDismiss]);

  const styles = VARIANT_STYLES[entry.variant];
  const Icon =
    entry.variant === "success" ? CheckCircle2 : entry.variant === "error" ? AlertCircle : Info;

  return (
    <div
      role="status"
      className={`relative overflow-hidden rounded-xl border border-line border-s-[3px] bg-surface shadow-card ${styles.accent}`}
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${styles.iconWrap}`}
        >
          <Icon size={17} className={styles.icon} strokeWidth={2.25} />
        </div>
        <p className="min-w-0 flex-1 pt-0.5 text-sm font-medium leading-6 text-ink">{entry.message}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-lg p-1.5 text-ink/40 transition hover:bg-paper hover:text-ink/70"
          aria-label="Close"
        >
          <X size={15} />
        </button>
      </div>
      <motion.div
        className={`absolute bottom-0 start-0 h-[2px] ${styles.progress}`}
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: entry.duration / 1000, ease: "linear" }}
      />
    </div>
  );
}

function ConfirmToast({
  entry,
  onCancel,
  onConfirm,
}: {
  entry: ConfirmItem;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      className="overflow-hidden rounded-xl border border-line border-s-[3px] border-s-danger bg-surface shadow-card"
    >
      <div className="flex items-start gap-3 px-4 py-4 sm:px-5">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-danger/10">
          <AlertTriangle size={18} className="text-danger" strokeWidth={2.25} />
        </div>
        <p className="min-w-0 flex-1 pt-1 text-sm leading-6 text-ink">{entry.message}</p>
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-line bg-paper/60 px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={entry.confirming}
          className="rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-ink/75 transition hover:bg-paper disabled:opacity-50"
        >
          {entry.cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={entry.confirming}
          className="inline-flex min-w-[5.5rem] items-center justify-center gap-2 rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white transition hover:bg-danger/90 disabled:opacity-50"
        >
          {entry.confirming ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              …
            </>
          ) : (
            entry.confirmLabel
          )}
        </button>
      </div>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
