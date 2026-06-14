"use client";

import { useMemo, useState } from "react";
import { PageShell, SectionHeader } from "~~/components/pulse";
import { AdapterCatalogModal } from "~~/components/pulse/adapters/AdapterCatalogModal";
import { AdapterList } from "~~/components/pulse/adapters/AdapterList";
import { AdapterSetupFlow } from "~~/components/pulse/adapters/AdapterSetupFlow";
import { ApiKeyModal } from "~~/components/pulse/adapters/ApiKeyModal";
import { DecisionLayerSection } from "~~/components/pulse/adapters/DecisionLayerSection";
import { ChainlinkActivityPanel } from "~~/components/pulse/chainlink/ChainlinkActivityPanel";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import { ADAPTER_CATALOG, AI_DECISION_CATALOG_ENTRY, type AdapterCatalogEntry } from "~~/constants/adapterCatalog";
import { usePulseStore } from "~~/services/store/pulseStore";

export const AdaptersPage = () => {
  const { configuredAdapters, mockConfigureAdapter, mockRevokeConfiguredAdapter } = usePulseStore();

  const [catalogOpen, setCatalogOpen] = useState(false);
  const [setupEntry, setSetupEntry] = useState<AdapterCatalogEntry | null>(null);
  const [keyAdapterId, setKeyAdapterId] = useState<string | null>(null);

  const configuredIds = useMemo(
    () => new Set(configuredAdapters.map(adapter => adapter.catalogId)),
    [configuredAdapters],
  );

  const keyAdapter = configuredAdapters.find(a => a.catalogId === keyAdapterId) ?? null;
  const signalAdapters = configuredAdapters.filter(a => !a.isDecisionLayer);

  const handleSetupComplete = async (params: {
    catalogId: string;
    name: string;
    typeLabel: string;
    adapterAddress: string;
    weight: number;
    capabilities: AdapterCatalogEntry["capabilities"];
    isDecisionLayer?: boolean;
  }) => {
    mockConfigureAdapter({ ...params, bindingStatus: "active" });

    try {
      await fetch("/api/adapters/bindings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          catalogId: params.catalogId,
          adapterAddress: params.adapterAddress,
          capabilities: params.capabilities,
        }),
      });
    } catch {
      // Mock binding API — local configure is sufficient for product validation.
    }
  };

  const openDecisionSetup = () => {
    setSetupEntry(AI_DECISION_CATALOG_ENTRY);
  };

  return (
    <PageShell>
      <SectionHeader
        title="Signal adapters"
        eyebrow="data plane"
        subtitle="Configure Pulse-hosted adapters and weights. Deploy PulseOracle once; authorize signers per profile."
      />

      <div className="space-y-8">
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="pulse-section-title">Configured adapters</h2>
            <PulseButton onClick={() => setCatalogOpen(true)}>Add from catalog</PulseButton>
          </div>
          <AdapterList
            adapters={signalAdapters}
            onManageKeys={setKeyAdapterId}
            onRevoke={catalogId => {
              mockRevokeConfiguredAdapter(catalogId);
              void fetch(`/api/adapters/bindings/${encodeURIComponent(catalogId)}`, { method: "DELETE" });
            }}
          />
        </section>

        <DecisionLayerSection onSetup={openDecisionSetup} />

        <section className="space-y-4">
          <div>
            <h2 className="pulse-section-title">Adapter dev tools</h2>
            <p className="mt-1 text-sm text-pulse-muted">
              Simulate passive onchain activity reporting (CRE) — for adapter integration testing, not profile
              browsing.
            </p>
          </div>
          <ChainlinkActivityPanel />
        </section>
      </div>

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

      <ApiKeyModal
        adapter={keyAdapter}
        onClose={() => setKeyAdapterId(null)}
        onRotate={catalogId => {
          const existing = configuredAdapters.find(a => a.catalogId === catalogId);
          if (existing) mockConfigureAdapter({ ...existing, bindingStatus: "active" });
        }}
        onRevoke={catalogId => {
          mockRevokeConfiguredAdapter(catalogId);
          void fetch(`/api/adapters/bindings/${encodeURIComponent(catalogId)}`, { method: "DELETE" });
        }}
      />
    </PageShell>
  );
};
