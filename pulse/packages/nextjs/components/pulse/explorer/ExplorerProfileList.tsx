"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { EvidenceViewer } from "~~/components/pulse/explorer/EvidenceViewer";
import { LifecycleStateBadge } from "~~/components/pulse/ui/LifecycleStateBadge";
import { StatusTag } from "~~/components/pulse/ui/StatusTag";
import { useCanAccessProfileConsole } from "~~/hooks/pulse/useProfileConsole";
import type { PublicOwnerProfileView, PublicThresholdEvent } from "~~/types/pulse";
import { truncateHash } from "~~/utils/pulse/profileId";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium", timeStyle: "short" });

const SparseTimeline = ({ timestamps }: { timestamps: string[] }) => {
  if (timestamps.length === 0) {
    return <p className="text-xs text-pulse-muted">No signal activity recorded yet.</p>;
  }

  const sorted = [...timestamps].sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );
  const min = new Date(sorted[0]).getTime();
  const max = new Date(sorted[sorted.length - 1]).getTime();
  const span = Math.max(max - min, 1);

  return (
    <div className="space-y-2">
      <div className="relative h-8 rounded-full bg-base-300/60">
        {sorted.map((timestamp, index) => {
          const position = ((new Date(timestamp).getTime() - min) / span) * 100;
          return (
            <span
              key={`${timestamp}-${index}`}
              className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/80"
              style={{ left: `${position}%` }}
              title={formatDate(timestamp)}
            />
          );
        })}
      </div>
      <p className="text-xs text-pulse-muted">
        {sorted.length} signal{sorted.length === 1 ? "" : "s"} over time — timing only, no content or weight.
      </p>
    </div>
  );
};

const ViewEvidenceButton = ({
  blobId,
  profileId,
}: {
  blobId: string;
  profileId: string;
}) => {
  const [openBlobId, setOpenBlobId] = useState<string | null>(null);
  const canAccess = useCanAccessProfileConsole(profileId);
  const { address } = useAccount();

  return (
    <>
      {address && canAccess ? (
        <button
          type="button"
          className="btn btn-ghost btn-xs rounded-lg"
          onClick={() => setOpenBlobId(blobId)}
        >
          View evidence
        </button>
      ) : (
        <span className="text-xs text-pulse-muted">Evidence available to authorized parties.</span>
      )}
      <EvidenceViewer
        blobId={openBlobId}
        onClose={() => setOpenBlobId(null)}
        mode={canAccess ? "private" : "public"}
      />
    </>
  );
};

const ThresholdEvents = ({
  events,
  profileId,
}: {
  events: PublicThresholdEvent[];
  profileId: string;
}) => {
  if (events.length === 0) return null;

  return (
    <div className="mt-4 space-y-2">
      <h4 className="text-xs font-medium uppercase tracking-wide text-pulse-muted">Threshold events</h4>
      <ul className="space-y-2">
        {events.map(event => (
          <li
            key={event.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-base-content/10 px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium">{event.kind.replace("_", " ")}</p>
              <p className="text-xs text-pulse-muted">{formatDate(event.timestamp)} · epoch {event.epoch}</p>
            </div>
            <ViewEvidenceButton blobId={event.auditBlobId} profileId={profileId} />
          </li>
        ))}
      </ul>
    </div>
  );
};

const ProfileCard = ({ profile }: { profile: PublicOwnerProfileView }) => (
  <article className="pulse-card p-5 sm:p-6">
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="pulse-label mb-1">Consumer context</p>
        <p className="font-mono text-xs">{truncateHash(profile.consumerContextHash, 10)}</p>
      </div>
      <LifecycleStateBadge state={profile.lifecycle} />
    </div>

    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-pulse-muted">Adapter types</p>
        {profile.adapterTypes.length === 0 ? (
          <p className="text-sm text-pulse-muted">No adapters configured on this profile.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.adapterTypes.map(type => (
              <StatusTag key={type} label={type} tone="neutral" />
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-pulse-muted">Signal activity</p>
        <dl className="mb-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-pulse-muted">Total signals</dt>
            <dd className="font-mono">{profile.signalCount}</dd>
          </div>
          <div>
            <dt className="text-xs text-pulse-muted">Most recent</dt>
            <dd>{profile.lastSignalAt ? formatDate(profile.lastSignalAt) : "—"}</dd>
          </div>
        </dl>
        <SparseTimeline timestamps={profile.signalTimestamps} />
      </div>

      <ThresholdEvents events={profile.thresholdEvents} profileId={profile.profileId} />
    </div>
  </article>
);

export const ExplorerProfileList = ({ profiles }: { profiles: PublicOwnerProfileView[] }) => (
  <section className="space-y-4">
    <div>
      <h2 className="pulse-section-title">Profiles by consumer context</h2>
      <p className="mt-1 text-sm text-pulse-muted">
        One card per monitoring relationship. Oracle state and activity are public; accumulated weight and signal
        details stay private to each consumer.
      </p>
    </div>
    {profiles.map(profile => (
      <ProfileCard key={profile.profileId} profile={profile} />
    ))}
  </section>
);
