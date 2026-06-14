"use client";

import { PUBLIC_VIEW_NOTE } from "~~/constants/explorerCopy";
import { usePublicSignalFeed } from "~~/hooks/pulse/usePublicSignalFeed";
import { normalizeAddress } from "~~/utils/pulse/explorerAddress";

type ProfileHeaderProps = {
  ownerAddress: string;
};

export const ProfileHeader = ({ ownerAddress }: ProfileHeaderProps) => {
  const feed = usePublicSignalFeed(ownerAddress);
  const display = normalizeAddress(ownerAddress);

  const firstLabel = feed.firstSignalAt
    ? new Date(feed.firstSignalAt).toLocaleDateString(undefined, { dateStyle: "medium" })
    : "—";
  const lastLabel = feed.lastSignalAt
    ? new Date(feed.lastSignalAt).toLocaleDateString(undefined, { dateStyle: "medium" })
    : "—";

  return (
    <header className="pulse-card p-5 sm:p-6">
      <p className="pulse-label mb-2">Owner address</p>
      <p className="break-all font-mono text-sm sm:text-base">{display}</p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <dt className="text-xs text-pulse-muted">Total signals</dt>
          <dd className="font-mono text-lg">{feed.totalCount}</dd>
        </div>
        <div>
          <dt className="text-xs text-pulse-muted">First signal</dt>
          <dd className="text-sm">{firstLabel}</dd>
        </div>
        <div>
          <dt className="text-xs text-pulse-muted">Last signal</dt>
          <dd className="text-sm">{lastLabel}</dd>
        </div>
      </dl>
    </header>
  );
};

export const PublicViewNote = () => (
  <p className="rounded-2xl border border-base-content/10 bg-base-200/40 px-4 py-3 text-sm leading-relaxed text-pulse-muted">
    {PUBLIC_VIEW_NOTE}
  </p>
);

export const SignalCountByContext = ({ ownerAddress }: { ownerAddress: string }) => {
  const feed = usePublicSignalFeed(ownerAddress);

  if (!feed.hasActivity) return null;

  return (
    <section className="pulse-card p-5 sm:p-6">
      <h2 className="pulse-section-title mb-1">Signals by consumer context</h2>
      <p className="mb-4 text-sm text-pulse-muted">
        Counts per consumer context hash — activity from multiple apps without revealing which apps.
      </p>
      {feed.contextCounts.length === 0 ? (
        <p className="text-sm text-pulse-muted">No context breakdown yet.</p>
      ) : (
        <ul className="divide-y divide-base-content/10 rounded-2xl border border-base-content/10">
          {feed.contextCounts.map(({ consumerContextHash, count }) => (
            <li key={consumerContextHash} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="font-mono text-xs">{consumerContextHash.slice(0, 12)}…</span>
              <span className="font-mono">{count}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
