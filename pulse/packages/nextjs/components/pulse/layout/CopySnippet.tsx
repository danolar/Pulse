"use client";

import { useCallback } from "react";
import { Copy } from "lucide-react";
import { notification } from "~~/utils/scaffold-eth/notification";

type CopySnippetProps = {
  code: string;
  label?: string;
};

export const CopySnippet = ({ code, label = "Snippet" }: CopySnippetProps) => {
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      notification.success(`${label} copied`);
    } catch {
      notification.error("Could not copy to clipboard");
    }
  }, [code, label]);

  return (
    <div className="relative rounded-xl bg-base-200/80">
      <button
        type="button"
        className="btn btn-ghost btn-xs absolute right-2 top-2"
        aria-label={`Copy ${label}`}
        onClick={handleCopy}
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
      <pre className="overflow-x-auto p-3 pr-10 font-mono text-[11px] leading-relaxed">{code}</pre>
    </div>
  );
};
