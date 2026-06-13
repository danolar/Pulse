"use client";

import { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";

type PulseModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg";
};

export const PulseModal = ({ open, title, onClose, children, footer, size = "md" }: PulseModalProps) => {
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

  const maxWidth = size === "lg" ? "max-w-3xl" : "max-w-xl";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-base-content/30 backdrop-blur-[2px]"
        aria-label="Close modal"
        onClick={onClose}
      />
      <div className={`relative z-10 w-full ${maxWidth} rounded-2xl bg-base-100 p-6 shadow-pulse-lg`}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="min-w-0 flex-1 pr-2 text-lg font-semibold leading-snug text-base-content">{title}</h2>
          <button type="button" className="btn btn-ghost btn-sm btn-circle" aria-label="Close" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">{children}</div>
        {footer ? <div className="mt-6 border-t border-base-content/10 pt-4">{footer}</div> : null}
      </div>
    </div>
  );
};

type KeyValuePreviewProps = {
  items: Array<{ label: string; value: string }>;
};

export const KeyValuePreview = ({ items }: KeyValuePreviewProps) => {
  return (
    <dl className="space-y-3">
      {items.map(item => (
        <div key={item.label} className="rounded-2xl bg-base-200/70 p-3">
          <dt className="text-xs uppercase tracking-wide text-pulse-muted">{item.label}</dt>
          <dd className="mt-1 whitespace-pre-wrap break-words text-sm text-base-content">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
};

export const ModalFooterActions = ({
  onCancel,
  onSave,
  onDelete,
  saveLabel = "Save",
}: {
  onCancel: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  saveLabel?: string;
}) => {
  return (
    <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
      {onDelete ? (
        <PulseButton variant="destructive" className="w-full sm:mr-auto sm:w-auto" onClick={onDelete}>
          Delete
        </PulseButton>
      ) : null}
      <PulseButton variant="secondary" className="w-full sm:w-auto" onClick={onCancel}>
        Cancel
      </PulseButton>
      {onSave ? (
        <PulseButton className="w-full sm:w-auto" onClick={onSave}>
          {saveLabel}
        </PulseButton>
      ) : null}
    </div>
  );
};
