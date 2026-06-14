"use client";

import { PulseModal } from "~~/components/pulse/modals/PulseModal";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import { StatusTag } from "~~/components/pulse/ui/StatusTag";
import type { AdapterCatalogEntry } from "~~/constants/adapterCatalog";

type AdapterCatalogModalProps = {
  open: boolean;
  entries: AdapterCatalogEntry[];
  configuredIds: Set<string>;
  onClose: () => void;
  onSelect: (entry: AdapterCatalogEntry) => void;
};

export const AdapterCatalogModal = ({
  open,
  entries,
  configuredIds,
  onClose,
  onSelect,
}: AdapterCatalogModalProps) => (
  <PulseModal
    open={open}
    title="Adapter catalog"
    onClose={onClose}
    size="lg"
    footer={
      <div className="flex justify-end">
        <PulseButton variant="ghost" onClick={onClose}>
          Close
        </PulseButton>
      </div>
    }
  >
    <div className="space-y-3">
      {entries.map(entry => {
        const configured = configuredIds.has(entry.id);
        return (
          <div
            key={entry.id}
            className="flex flex-col gap-3 rounded-2xl border border-base-content/10 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="pulse-item-title">{entry.name}</span>
                <StatusTag label={entry.typeLabel} tone="neutral" />
                {entry.isInternal ? <StatusTag label="Pulse-hosted" tone="accent" /> : null}
                {entry.isDecisionLayer ? <StatusTag label="Decision layer" tone="accent" /> : null}
              </div>
              <p className="text-sm text-pulse-muted">{entry.description}</p>
              <p className="mt-1 text-xs text-pulse-muted">
                Suggested weight: {entry.suggestedWeight} · {entry.capabilities}
              </p>
            </div>
            <PulseButton
              variant={configured ? "ghost" : "primary"}
              disabled={configured}
              onClick={() => onSelect(entry)}
            >
              {configured ? "Configured" : "Set up"}
            </PulseButton>
          </div>
        );
      })}
    </div>
  </PulseModal>
);
