"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { CopyRow } from "~~/components/pulse";
import { EvidenceViewer } from "~~/components/pulse/explorer/EvidenceViewer";
import { StatusTag } from "~~/components/pulse/ui/StatusTag";
import { usePublicSignalFeed } from "~~/hooks/pulse/usePublicSignalFeed";
import { usePulseStore } from "~~/services/store/pulseStore";
import type { PublicSignalRecord } from "~~/types/pulse";
import { normalizeAddress } from "~~/utils/pulse/explorerAddress";
import { truncateHash } from "~~/utils/pulse/profileId";

type ViewBlobButtonProps = {
  signal: PublicSignalRecord;
  ownerAddress: string;
  onView: (blobId: string) => void;
};

export const ViewBlobButton = ({ signal, ownerAddress, onView }: ViewBlobButtonProps) => {
  const { address } = useAccount();
  const consumerAddress = usePulseStore(state => state.consumerAddress);

  const hasAccess =
    Boolean(address) &&
    Boolean(consumerAddress) &&
    usePulseStore
      .getState()
      .getProfilesByConsumer(consumerAddress!)
      .some(
        profile =>
          profile.ownerAddress &&
          normalizeAddress(profile.ownerAddress) === normalizeAddress(ownerAddress),
      );

  if (!address) {
    return (
      <p className="text-xs text-pulse-muted">Connect a wallet with access to decrypt.</p>
    );
  }

  if (!hasAccess) {
    return <p className="text-xs text-pulse-muted">No Seal access for this blob.</p>;
  }

  return (
    <button type="button" className="btn btn-ghost btn-xs rounded-lg" onClick={() => onView(signal.blobId)}>
      View blob
    </button>
  );
};

const EncryptedSignalRow = ({
  signal,
  ownerAddress,
  onView,
}: {
  signal: PublicSignalRecord;
  ownerAddress: string;
  onView: (blobId: string) => void;
}) => {
  const timestamp = new Date(signal.timestamp).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <article className="border-b border-base-content/10 px-4 py-4 last:border-b-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <CopyRow label="Blob ID" value={signal.blobId} />
          <p className="text-xs text-pulse-muted">{timestamp}</p>
        </div>
        <StatusTag
          label={signal.status === "decrypted" ? "Decrypted" : "Encrypted"}
          tone={signal.status === "decrypted" ? "success" : "neutral"}
        />
      </div>
      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
        <div>
          <dt className="text-pulse-muted">Adapter</dt>
          <dd className="font-mono">{truncateHash(signal.adapterAddress, 10)}</dd>
        </div>
        <div>
          <dt className="text-pulse-muted">Consumer context</dt>
          <dd className="font-mono">{truncateHash(signal.consumerContextHash, 10)}</dd>
        </div>
      </dl>
      <div className="mt-3">
        <ViewBlobButton signal={signal} ownerAddress={ownerAddress} onView={onView} />
      </div>
    </article>
  );
};

export const EncryptedSignalFeed = ({ ownerAddress }: { ownerAddress: string }) => {
  const feed = usePublicSignalFeed(ownerAddress);
  const [viewBlobId, setViewBlobId] = useState<string | null>(null);

  return (
    <>
      <section className="pulse-card overflow-hidden">
        <div className="border-b border-base-content/10 px-5 py-4 sm:px-6">
          <h2 className="pulse-section-title">Encrypted signal feed</h2>
          <p className="mt-1 text-sm text-pulse-muted">
            Walrus blob references across all consumer contexts — content remains encrypted.
          </p>
        </div>

        {feed.signals.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-pulse-muted sm:px-6">
            No encrypted signals recorded for this address yet.
          </p>
        ) : (
          <div>
            {feed.signals.map(signal => (
              <EncryptedSignalRow
                key={signal.id}
                signal={signal}
                ownerAddress={ownerAddress}
                onView={setViewBlobId}
              />
            ))}
          </div>
        )}
      </section>

      <EvidenceViewer blobId={viewBlobId} onClose={() => setViewBlobId(null)} mode="public" />
    </>
  );
};
