"use client";

import { useState } from "react";
import { ConsoleSignalTimeline } from "~~/components/pulse/console/ConsoleSignalTimeline";
import { EvidenceViewer } from "~~/components/pulse/explorer/EvidenceViewer";
import type { ConsoleSignal, LifecycleState } from "~~/types/pulse";

type SignalTimelineProps = {
  signals: ConsoleSignal[];
  lifecycle: LifecycleState;
};

export const SignalTimeline = ({ signals, lifecycle }: SignalTimelineProps) => {
  const [evidenceBlobId, setEvidenceBlobId] = useState<string | null>(null);

  return (
    <>
      {lifecycle === "THRESHOLD_REACHED" ? (
        <section className="pulse-card border-error/20 p-5 sm:p-6">
          <h2 className="pulse-section-title mb-2">Threshold reached</h2>
          <p className="mb-3 text-sm text-pulse-muted">
            Outcome event emitted with Walrus audit bundle reference.
          </p>
          {signals[0]?.walrusBlobId ? (
            <button
              type="button"
              className="link link-primary text-sm"
              onClick={() => setEvidenceBlobId(signals[0].walrusBlobId)}
            >
              View evidence bundle
            </button>
          ) : null}
        </section>
      ) : null}

      <ConsoleSignalTimeline
        signals={signals}
        onViewEvidence={blobId => setEvidenceBlobId(blobId)}
      />

      <EvidenceViewer blobId={evidenceBlobId} onClose={() => setEvidenceBlobId(null)} />
    </>
  );
};
