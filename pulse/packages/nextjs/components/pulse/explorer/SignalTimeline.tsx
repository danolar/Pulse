"use client";

import { useState } from "react";
import { ConsoleSignalTimeline } from "~~/components/pulse/console/ConsoleSignalTimeline";
import { EvidenceViewer } from "~~/components/pulse/explorer/EvidenceViewer";
import { OnchainVerifiedBadge } from "~~/components/pulse/ui/OnchainVerifiedBadge";
import { SIGNAL_ACTIVITY_NOTE, SIGNAL_ACTIVITY_TITLE } from "~~/constants/explorerCopy";
import type { ConsoleSignal, LifecycleState, PublicThresholdEvent } from "~~/types/pulse";

type SignalTimelineProps = {
  signals: ConsoleSignal[];
  lifecycle: LifecycleState;
  accumulatedWeight?: number;
  threshold?: number;
  onchainThresholdEvents?: PublicThresholdEvent[];
  onchainLoading?: boolean;
  preferOnchainSignals?: boolean;
};

export const SignalTimeline = ({
  signals,
  lifecycle,
  accumulatedWeight,
  threshold,
  onchainThresholdEvents = [],
  onchainLoading = false,
  preferOnchainSignals = false,
}: SignalTimelineProps) => {
  const [evidenceBlobId, setEvidenceBlobId] = useState<string | null>(null);
  const negativeCount = signals.filter(s => s.direction === "negative").length;
  const positiveCount = signals.filter(s => s.direction === "positive").length;
  const hasOnchainRows = signals.some(signal => signal.onchainVerified);
  const thresholdBlob =
    onchainThresholdEvents[0]?.auditBlobId ?? signals.find(signal => signal.direction === "negative")?.walrusBlobId;

  return (
    <>
      {onchainLoading ? (
        <p className="text-xs text-pulse-muted">Syncing onchain events from Sepolia…</p>
      ) : null}

      {lifecycle === "THRESHOLD_REACHED" || onchainThresholdEvents.length > 0 ? (
        <section className="pulse-card border-error/20 p-5 sm:p-6">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h2 className="pulse-section-title">Threshold reached</h2>
            {onchainThresholdEvents.length > 0 ? <OnchainVerifiedBadge /> : null}
          </div>
          <p className="mb-3 text-sm text-pulse-muted">
            Outcome event emitted with Walrus audit bundle reference.
          </p>
          {thresholdBlob ? (
            <button
              type="button"
              className="link link-primary text-sm"
              onClick={() => setEvidenceBlobId(thresholdBlob)}
            >
              View Walrus evidence bundle
            </button>
          ) : null}
        </section>
      ) : null}

      <ConsoleSignalTimeline
        signals={signals}
        title={preferOnchainSignals || hasOnchainRows ? "Onchain signal audit trail" : SIGNAL_ACTIVITY_TITLE}
        subtitle={
          preferOnchainSignals || hasOnchainRows
            ? "Decoded from PulseOracleV2 on Sepolia. View evidence resolves keccak256(blobId) to Walrus testnet."
            : SIGNAL_ACTIVITY_NOTE
        }
        summary={
          accumulatedWeight !== undefined && threshold !== undefined ? (
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="badge badge-sm border-none bg-base-300">
                {signals.length} events this epoch
              </span>
              <span className="badge badge-sm border-none bg-base-300">{negativeCount} toward threshold</span>
              <span className="badge badge-sm border-none bg-base-300">{positiveCount} proof-of-life</span>
              <span className="badge badge-sm border-none bg-primary/10 text-primary">
                {accumulatedWeight} / {threshold} weight on gauge
              </span>
            </div>
          ) : null
        }
        onViewEvidence={blobId => setEvidenceBlobId(blobId)}
      />

      <EvidenceViewer blobId={evidenceBlobId} onClose={() => setEvidenceBlobId(null)} />
    </>
  );
};
