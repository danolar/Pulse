"use client";

import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import { StatusTag } from "~~/components/pulse/ui/StatusTag";
import { AI_DECISION_CATALOG_ENTRY } from "~~/constants/adapterCatalog";
import { usePulseStore } from "~~/services/store/pulseStore";

type DecisionLayerSectionProps = {
  onSetup: () => void;
};

export const DecisionLayerSection = ({ onSetup }: DecisionLayerSectionProps) => {
  const configured = usePulseStore(state =>
    state.configuredAdapters.find(a => a.catalogId === AI_DECISION_CATALOG_ENTRY.id),
  );
  const authorized = usePulseStore(state =>
    state.adapters.some(a => a.moduleId === AI_DECISION_CATALOG_ENTRY.id && a.address?.trim()),
  );

  return (
    <section className="pulse-card p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="pulse-section-title">Evaluation gate (AI decision)</h2>
          <p className="mt-1 text-sm text-pulse-muted">
            Gates formal evaluation requests. Does not contribute weight toward threshold.
          </p>
        </div>
        {authorized ? <StatusTag label="Authorized on profile" tone="success" /> : null}
      </div>

      <p className="mb-4 text-xs text-pulse-muted">
        Randomness is configured in Setup → Rhythm. This step binds the decision agent only.
      </p>

      <PulseButton variant="secondary" onClick={onSetup} disabled={Boolean(configured && authorized)}>
        {configured && authorized ? "AI gate configured" : "Configure AI decision agent"}
      </PulseButton>
    </section>
  );
};
