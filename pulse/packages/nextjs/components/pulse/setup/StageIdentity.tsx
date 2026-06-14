"use client";

import { WorldIDConfigStatus } from "~~/components/pulse/setup/identity/WorldIDConfigStatus";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import { VerifiedCheck } from "~~/components/pulse/ui/VerifiedCheck";
import { usePulseStore } from "~~/services/store/pulseStore";

export const StageIdentity = () => {
  const { identityIntegrated, mockAcknowledgeIdentity } = usePulseStore();

  return (
    <div className="space-y-6">
      <WorldIDConfigStatus />
      <section className="pulse-card p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="pulse-section-title">Confirm integration</h2>
            <p className="mt-1 text-sm text-pulse-muted">
              Mark this step complete once World ID is wired in your app.
            </p>
          </div>
          <VerifiedCheck verified={identityIntegrated} label="Integrated" />
        </div>
        <PulseButton
          variant="secondary"
          disabled={identityIntegrated}
          onClick={() => mockAcknowledgeIdentity()}
        >
          World ID is integrated in my app
        </PulseButton>
      </section>
    </div>
  );
};
