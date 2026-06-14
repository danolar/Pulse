"use client";

import { ConsoleSignalTimeline } from "~~/components/pulse/console/ConsoleSignalTimeline";
import { EvidenceViewer } from "~~/components/pulse/explorer/EvidenceViewer";
import { OnchainVerifiedBadge } from "~~/components/pulse/ui/OnchainVerifiedBadge";
import { usePulseOnchainEvents } from "~~/hooks/pulse/usePulseOnchainEvents";
import type { PublicThresholdEvent } from "~~/types/pulse";
import { useState } from "react";

type ProfileOnchainFeedProps = {
  profileId: string;
  ownerAddress: string;
};

const OnchainThresholdEvents = ({
  events,
  onViewEvidence,
}: {
  events: PublicThresholdEvent[];
  onViewEvidence: (blobId: string) => void;
}) => {
  if (events.length === 0) return null;

  return (
    <div className="mt-4 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-xs font-medium uppercase tracking-wide text-pulse-muted">Threshold events (Sepolia)</h4>
        <OnchainVerifiedBadge />
      </div>
      <ul className="space-y-2">
        {events.map(event => (
          <li
            key={event.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-base-content/10 px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium">{event.kind.replace("_", " ")}</p>
              <p className="text-xs text-pulse-muted">
                {new Date(event.timestamp).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
                , epoch {event.epoch}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-xs rounded-lg"
              onClick={() => onViewEvidence(event.auditBlobId)}
            >
              View Walrus evidence
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const ProfileOnchainFeed = ({ profileId, ownerAddress }: ProfileOnchainFeedProps) => {
  const [evidenceBlobId, setEvidenceBlobId] = useState<string | null>(null);
  const onchain = usePulseOnchainEvents({ profileId, ownerAddress });

  if (!onchain.isEnabled) return null;

  if (onchain.isLoading) {
    return <p className="text-xs text-pulse-muted">Loading onchain events from Sepolia…</p>;
  }

  if (onchain.consoleSignals.length === 0 && onchain.thresholdEvents.length === 0) {
    return null;
  }

  return (
    <>
      {onchain.consoleSignals.length > 0 ? (
        <ConsoleSignalTimeline
          signals={onchain.consoleSignals}
          title="Onchain signals"
          subtitle="PulseOracleV2 events on Sepolia. Weights are omitted in the public explorer."
          onViewEvidence={blobId => setEvidenceBlobId(blobId)}
        />
      ) : null}

      <OnchainThresholdEvents
        events={onchain.thresholdEvents}
        onViewEvidence={blobId => setEvidenceBlobId(blobId)}
      />

      <EvidenceViewer blobId={evidenceBlobId} onClose={() => setEvidenceBlobId(null)} mode="public" />
    </>
  );
};
