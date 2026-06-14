"use client";

import { useMemo, useState } from "react";
import { AdapterCatalogModal } from "~~/components/pulse/adapters/AdapterCatalogModal";
import { AdapterSetupFlow } from "~~/components/pulse/adapters/AdapterSetupFlow";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import { StatusTag } from "~~/components/pulse/ui/StatusTag";
import { ADAPTER_CATALOG, type AdapterCatalogEntry } from "~~/constants/adapterCatalog";
import { INTERNAL_ADAPTERS_INTRO } from "~~/constants/internalAdapters";
import { usePulseStore } from "~~/services/store/pulseStore";

export const ConsumerAdaptersSection = () => {
  const { configuredAdapters, mockConfigureAdapter, mockRevokeConfiguredAdapter } = usePulseStore();
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [setupEntry, setSetupEntry] = useState<AdapterCatalogEntry | null>(null);

  const configuredIds = useMemo(
    () => new Set(configuredAdapters.map(adapter => adapter.catalogId)),
    [configuredAdapters],
  );

  const handleSetupComplete = (params: {
    catalogId: string;
    name: string;
    typeLabel: string;
    adapterAddress: string;
    weight: number;
    capabilities: AdapterCatalogEntry["capabilities"];
    isDecisionLayer?: boolean;
  }) => {
    mockConfigureAdapter({ ...params, bindingStatus: "active" });
  };

  return (
    <>
      <section className="pulse-card p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="pulse-section-title">Signal adapters</h2>
            <p className="mt-1 text-sm text-pulse-muted">
              Enable Pulse-hosted adapters and set weights. End users link Google or phone in your app.
            </p>
          </div>
          <PulseButton onClick={() => setCatalogOpen(true)}>Add from catalog</PulseButton>
        </div>

        <p className="mb-4 rounded-2xl border border-base-content/10 bg-base-200/40 px-4 py-3 text-xs leading-relaxed text-pulse-muted">
          {INTERNAL_ADAPTERS_INTRO}
        </p>

        {configuredAdapters.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-base-content/15 px-4 py-10 text-center">
            <p className="mb-1 text-sm font-medium">No adapters configured</p>
            <p className="mb-4 text-sm text-pulse-muted">
              Add at least one adapter with a weight before continuing.
            </p>
            <PulseButton onClick={() => setCatalogOpen(true)}>Browse catalog</PulseButton>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-base-content/10">
            <table className="table table-sm">
              <thead>
                <tr className="text-pulse-muted">
                  <th>Adapter</th>
                  <th className="hidden sm:table-cell">Signer</th>
                  <th className="w-28">Weight</th>
                  <th className="w-24" />
                </tr>
              </thead>
              <tbody>
                {configuredAdapters.map(adapter => (
                  <tr key={adapter.catalogId}>
                    <td>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{adapter.name}</span>
                        <StatusTag label={adapter.typeLabel} tone="neutral" />
                        <StatusTag label={adapter.bindingStatus} tone="success" />
                      </div>
                    </td>
                    <td className="hidden font-mono text-xs sm:table-cell">{adapter.adapterAddress}</td>
                    <td className="font-mono text-sm">{adapter.isDecisionLayer ? "0 (gate)" : adapter.weight}</td>
                    <td className="text-right">
                      <PulseButton
                        variant="ghost"
                        className="btn-xs"
                        onClick={() => mockRevokeConfiguredAdapter(adapter.catalogId)}
                      >
                        Remove
                      </PulseButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AdapterCatalogModal
        open={catalogOpen}
        entries={ADAPTER_CATALOG}
        configuredIds={configuredIds}
        onClose={() => setCatalogOpen(false)}
        onSelect={entry => {
          setCatalogOpen(false);
          setSetupEntry(entry);
        }}
      />

      <AdapterSetupFlow
        entry={setupEntry}
        onClose={() => setSetupEntry(null)}
        onComplete={handleSetupComplete}
      />
    </>
  );
};
