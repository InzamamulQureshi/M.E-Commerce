"use client";

import { useEffect, useState, ReactNode } from "react";
import { createPortal } from "react-dom";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
  className?: string;
}

export function AdminModal({
  isOpen,
  onClose,
  children,
  maxWidth = "max-w-xl",
  className = "",
}: AdminModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] w-full h-[100dvh] bg-black/65 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto overscroll-contain animate-in fade-in duration-200 select-none"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`w-full ${maxWidth} relative my-auto max-h-[92dvh] sm:max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 select-text overflow-hidden ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
