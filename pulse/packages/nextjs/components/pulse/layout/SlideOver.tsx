"use client";

import { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";

type SlideOverProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export const SlideOver = ({ open, title, onClose, children }: SlideOverProps) => {
  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        className="absolute inset-0 bg-base-content/30 backdrop-blur-[2px]"
        aria-label="Close panel"
        onClick={onClose}
      />
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-base-content/10 bg-base-100 shadow-pulse-lg">
        <div className="flex items-start justify-between gap-4 border-b border-base-content/10 px-5 py-4">
          <h2 className="pulse-section-title text-lg">{title}</h2>
          <button type="button" className="btn btn-ghost btn-sm btn-circle" aria-label="Close" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </aside>
    </div>
  );
};
