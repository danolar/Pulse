"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { KeyValuePreview, PulseModal } from "~~/components/pulse/modals/PulseModal";
import { formatWalrusEvidence, getWalrusBlobUrl, parseWalrusBlobId } from "~~/utils/walrus";

type WalrusEvidenceModalProps = {
  open: boolean;
  blobRef: string;
  signalType: string;
  onClose: () => void;
};

type LoadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; text: string; isJson: boolean; blobId: string };

export const WalrusEvidenceModal = ({ open, blobRef, signalType, onClose }: WalrusEvidenceModalProps) => {
  const [state, setState] = useState<LoadState>({ status: "idle" });

  const loadEvidence = useCallback(async () => {
    const blobId = parseWalrusBlobId(blobRef);
    if (!blobId) {
      setState({
        status: "error",
        message: "This signal uses a placeholder blob ref. Run yarn test:walrus-roundtrip to seed testnet blobs.",
      });
      return;
    }

    setState({ status: "loading" });

    try {
      const response = await fetch(`/api/walrus/blobs/${encodeURIComponent(blobId)}`);
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `HTTP ${response.status}`);
      }

      const bytes = await response.arrayBuffer();
      const formatted = formatWalrusEvidence(bytes);
      setState({ status: "ready", ...formatted, blobId });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load evidence";
      setState({ status: "error", message });
    }
  }, [blobRef]);

  useEffect(() => {
    if (!open) {
      setState({ status: "idle" });
      return;
    }
    void loadEvidence();
  }, [open, loadEvidence]);

  const blobId = state.status === "ready" ? state.blobId : parseWalrusBlobId(blobRef);

  return (
    <PulseModal open={open} title={`Evidence · ${signalType}`} onClose={onClose} size="lg">
      {state.status === "loading" ? (
        <div className="flex items-center gap-2 text-sm text-pulse-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading from Walrus testnet…
        </div>
      ) : null}

      {state.status === "error" ? (
        <div className="space-y-3">
          <p className="text-sm text-error">{state.message}</p>
          <p className="font-mono text-xs text-pulse-muted break-all">{blobRef}</p>
        </div>
      ) : null}

      {state.status === "ready" ? (
        <div className="space-y-4">
          <KeyValuePreview
            items={[
              { label: "Blob ID", value: state.blobId },
              { label: state.isJson ? "JSON evidence" : "Raw evidence", value: state.text },
            ]}
          />
          <a
            href={getWalrusBlobUrl(state.blobId)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm link"
          >
            Open on Walrus aggregator
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      ) : null}

      {!blobId && state.status === "idle" ? (
        <p className="text-sm text-pulse-muted">No Walrus blob linked to this signal yet.</p>
      ) : null}
    </PulseModal>
  );
};
