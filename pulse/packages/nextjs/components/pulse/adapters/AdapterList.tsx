"use client";

import { AdapterCard } from "~~/components/pulse/adapters/AdapterCard";
import type { ConfiguredAdapter } from "~~/types/pulse";

type AdapterListProps = {
  adapters: ConfiguredAdapter[];
  onManageKeys: (catalogId: string) => void;
  onRevoke: (catalogId: string) => void;
};

export const AdapterList = ({ adapters, onManageKeys, onRevoke }: AdapterListProps) => {
  if (adapters.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-base-content/15 px-4 py-8 text-center text-sm text-pulse-muted">
        No adapters configured yet. Add one from the catalog to bind credentials and authorize signers.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {adapters.map(adapter => (
        <AdapterCard
          key={adapter.catalogId}
          adapter={adapter}
          onManageKeys={() => onManageKeys(adapter.catalogId)}
          onRevoke={() => onRevoke(adapter.catalogId)}
        />
      ))}
    </div>
  );
};
