"use client";

import { useEffect, useState } from "react";
import { PulseModal } from "~~/components/pulse/modals/PulseModal";

type EvidenceViewerProps = {
  blobId: string | null;
  onClose: () => void;
  mode?: "public" | "private";
};

export const EvidenceViewer = ({ blobId, onClose, mode = "private" }: EvidenceViewerProps) => {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!blobId) {
      setContent(null);
      setError(null);
      return;
    }

    if (mode === "public") {
      setLoading(false);
      setContent(null);
      setError("Encrypted blob. Public routes never return decoded payload.");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const parsed = blobId.replace(/^walrus:/, "");

    fetch(`/api/walrus/blobs/${encodeURIComponent(parsed)}`)
      .then(async response => {
        if (!response.ok) {
          if (response.status === 403) throw new Error("Encrypted, no access");
          throw new Error("Could not load evidence");
        }
        return response.text();
      })
      .then(text => {
        if (!cancelled) setContent(text);
      })
      .catch(err => {
        if (!cancelled) {
          setContent(null);
          setError(err instanceof Error ? err.message : "Could not load evidence");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [blobId, mode]);

  return (
    <PulseModal open={Boolean(blobId)} title="Signal evidence" onClose={onClose} size="lg">
      {loading ? <p className="text-sm text-pulse-muted">Loading evidence…</p> : null}
      {error ? <p className="text-sm text-warning">{error}</p> : null}
      {content ? (
        <pre className="max-h-[50vh] overflow-auto rounded-xl bg-base-200/80 p-3 font-mono text-xs">{content}</pre>
      ) : null}
      {!loading && !error && !content && blobId && mode === "private" ? (
        <p className="text-sm text-pulse-muted">Evidence not available.</p>
      ) : null}
    </PulseModal>
  );
};
