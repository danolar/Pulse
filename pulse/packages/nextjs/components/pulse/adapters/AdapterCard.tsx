"use client";

import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import { AdapterStatusTag } from "~~/components/pulse/adapters/AdapterStatusTag";
import { getCatalogEntry } from "~~/constants/adapterCatalog";
import type { ConfiguredAdapter } from "~~/types/pulse";

type AdapterCardProps = {
  adapter: ConfiguredAdapter;
  onManageKeys: () => void;
  onRevoke: () => void;
};

export const AdapterCard = ({ adapter, onManageKeys, onRevoke }: AdapterCardProps) => {
  const catalogEntry = getCatalogEntry(adapter.catalogId);
  const isInternal = catalogEntry?.isInternal === true;

  return (
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
        {isInternal ? (
          <div className="flex flex-wrap gap-x-2">
            <dt>Hosted</dt>
            <dd className="text-base-content">Pulse infrastructure</dd>
          </div>
        ) : null}
      </dl>

      <div className="flex flex-wrap gap-2">
        {!isInternal ? (
          <PulseButton variant="secondary" className="btn-sm" onClick={onManageKeys}>
            Manage keys
          </PulseButton>
        ) : null}
        <PulseButton variant="ghost" className="btn-sm" onClick={onRevoke}>
          Remove
        </PulseButton>
      </div>
    </article>
  );
};
