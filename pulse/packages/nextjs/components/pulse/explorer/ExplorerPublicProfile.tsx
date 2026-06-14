"use client";

import { PUBLIC_VIEW_NOTE } from "~~/constants/explorerCopy";
import { useExplorerOwnerView } from "~~/hooks/pulse/useExplorerOwnerView";
import { normalizeAddress } from "~~/utils/pulse/explorerAddress";

type ProfileHeaderProps = {
  ownerAddress: string;
};

export const ProfileHeader = ({ ownerAddress }: ProfileHeaderProps) => {
  const view = useExplorerOwnerView(ownerAddress);
  const display = normalizeAddress(ownerAddress);

  const firstLabel = view.firstSignalAt
    ? new Date(view.firstSignalAt).toLocaleDateString(undefined, { dateStyle: "medium" })
    : "None";
  const lastLabel = view.lastSignalAt
    ? new Date(view.lastSignalAt).toLocaleDateString(undefined, { dateStyle: "medium" })
    : "None";

  return (
    <header className="pulse-card p-5 sm:p-6">
      <p className="pulse-label mb-2">Owner address</p>
      <p className="break-all font-mono text-sm sm:text-base">{display}</p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-4">
        <div>
          <dt className="text-xs text-pulse-muted">Consumer contexts</dt>
          <dd className="font-mono text-lg">{view.profiles.length}</dd>
        </div>
        <div>
          <dt className="text-xs text-pulse-muted">Total signals</dt>
          <dd className="font-mono text-lg">{view.totalSignalCount}</dd>
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
