"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

// Reusable animated dialog. The caller must always render <Modal open={...}> (never
// wrap it in `{condition && <Modal/>}`) — AnimatePresence needs to stay mounted across
// the open/close toggle so it can play the exit animation; if the parent unmounts the
// whole component instead, the exit animation never gets a chance to run.
export default function Modal({
  open,
  onClose,
  children,
  maxWidth = "max-w-sm",
  panelClassName = ""
}: {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  maxWidth?: string;
  panelClassName?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={onClose}
        >
          <motion.div
            className={`w-full ${maxWidth} rounded-2xl bg-surface p-6 shadow-raised ${panelClassName}`}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
