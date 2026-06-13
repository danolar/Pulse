"use client";

import { useEffect, useState } from "react";
import { PulseModal } from "~~/components/pulse/modals/PulseModal";
import { parseWalrusBlobId } from "~~/utils/walrus";

type EvidenceViewerProps = {
  blobId: string | null;
  onClose: () => void;
};

export const EvidenceViewer = ({ blobId, onClose }: EvidenceViewerProps) => {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const parsed = blobId ? parseWalrusBlobId(blobId) : null;

  useEffect(() => {
    if (!blobId || !parsed) {
      setContent(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

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
  }, [blobId, parsed]);

  return (
    <PulseModal open={Boolean(blobId)} title="Signal evidence" onClose={onClose} size="lg">
      {loading ? <p className="text-sm text-pulse-muted">Loading from Walrus…</p> : null}
      {error ? <p className="text-sm text-warning">{error}</p> : null}
      {content ? (
        <pre className="max-h-[50vh] overflow-auto rounded-xl bg-base-200/80 p-3 font-mono text-xs">{content}</pre>
      ) : null}
      {!loading && !error && !content && blobId ? (
        <p className="text-sm text-pulse-muted">No decoded payload (mock blob reference only).</p>
      ) : null}
    </PulseModal>
  );
};
