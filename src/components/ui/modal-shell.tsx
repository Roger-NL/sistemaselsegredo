"use client";

import { AnimatePresence, motion } from "framer-motion";

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  panelClassName?: string;
  backdropClassName?: string;
  zIndexClassName?: string;
}

export function ModalShell({
  isOpen,
  onClose,
  children,
  panelClassName = "",
  backdropClassName = "",
  zIndexClassName = "z-[9999]",
}: ModalShellProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className={`fixed inset-0 ${zIndexClassName} flex items-center justify-center p-4 pointer-events-auto`}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 bg-black/80 backdrop-blur-sm ${backdropClassName}`}
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
            className={`relative ${panelClassName}`}
            onClick={(event) => event.stopPropagation()}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
