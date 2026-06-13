"use client";

import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import { AdapterStatusTag } from "~~/components/pulse/adapters/AdapterStatusTag";
import type { ConfiguredAdapter } from "~~/types/pulse";

type AdapterCardProps = {
  adapter: ConfiguredAdapter;
  onManageKeys: () => void;
  onRevoke: () => void;
};

export const AdapterCard = ({ adapter, onManageKeys, onRevoke }: AdapterCardProps) => (
  <article className="rounded-2xl border border-base-content/10 bg-base-200/40 p-4">
    <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
      <div>
        <h3 className="pulse-item-title">{adapter.name}</h3>
        <p className="text-xs text-pulse-muted">{adapter.typeLabel}</p>
      </div>
      <AdapterStatusTag status={adapter.bindingStatus} />
    </div>

    <dl className="mb-4 space-y-1 text-xs text-pulse-muted">
      <div className="flex flex-wrap gap-x-2">
        <dt>Signer</dt>
        <dd className="font-mono text-base-content">{adapter.adapterAddress || "—"}</dd>
      </div>
      <div className="flex flex-wrap gap-x-2">
        <dt>Weight</dt>
        <dd>{adapter.isDecisionLayer ? "0 (decision gate)" : adapter.weight}</dd>
      </div>
      <div className="flex flex-wrap gap-x-2">
        <dt>Capabilities</dt>
        <dd className="capitalize">{adapter.capabilities}</dd>
      </div>
    </dl>

    <div className="flex flex-wrap gap-2">
      <PulseButton variant="secondary" className="btn-sm" onClick={onManageKeys}>
        Manage keys
      </PulseButton>
      <PulseButton variant="ghost" className="btn-sm" onClick={onRevoke}>
        Revoke
      </PulseButton>
    </div>
  </article>
);
