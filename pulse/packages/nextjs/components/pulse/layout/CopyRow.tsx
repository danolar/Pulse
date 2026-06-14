"use client";

import { useCallback } from "react";
import { Copy } from "lucide-react";
import { notification } from "~~/utils/scaffold-eth/notification";

type CopyRowProps = {
  label: string;
  value: string;
};

export const CopyRow = ({ label, value }: CopyRowProps) => {
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      notification.success(`${label} copied`);
    } catch {
      notification.error("Could not copy to clipboard");
    }
  }, [label, value]);

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl bg-base-200/60 px-3 py-2">
      <div className="min-w-0">
        <p className="text-xs font-medium text-pulse-muted">{label}</p>
        <p className="break-all font-mono text-xs">{value || "Not set"}</p>
      </div>
      <button
        type="button"
        className="btn btn-ghost btn-xs btn-square shrink-0"
        aria-label={`Copy ${label}`}
        disabled={!value}
        onClick={handleCopy}
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
