"use client";

import { useState } from "react";
import { ConsoleSignalTimeline } from "~~/components/pulse/console/ConsoleSignalTimeline";
import { EvidenceViewer } from "~~/components/pulse/explorer/EvidenceViewer";
import { SIGNAL_ACTIVITY_NOTE, SIGNAL_ACTIVITY_TITLE } from "~~/constants/explorerCopy";
import type { ConsoleSignal, LifecycleState } from "~~/types/pulse";

type SignalTimelineProps = {
  signals: ConsoleSignal[];
  lifecycle: LifecycleState;
  accumulatedWeight?: number;
  threshold?: number;
};

export const SignalTimeline = ({
  signals,
  lifecycle,
  accumulatedWeight,
  threshold,
}: SignalTimelineProps) => {
  const [evidenceBlobId, setEvidenceBlobId] = useState<string | null>(null);
  const negativeCount = signals.filter(s => s.direction === "negative").length;
  const positiveCount = signals.filter(s => s.direction === "positive").length;

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
        title={SIGNAL_ACTIVITY_TITLE}
        subtitle={SIGNAL_ACTIVITY_NOTE}
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
