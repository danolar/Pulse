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
            <h2 className="pulse-section-title">World ID in your app</h2>
            <p className="mt-1 text-sm text-pulse-muted">
              Your users complete Device and Orb verifications inside your consumer app (for example Legacy
              Ledger). Pulse Explorer only documents the action strings — it does not perform user onboarding.
            </p>
          </div>
          <VerifiedCheck verified={identityIntegrated} label="Documented in my app" />
        </div>
        <PulseButton
          variant="secondary"
          disabled={identityIntegrated}
          onClick={() => mockAcknowledgeIdentity()}
        >
          I have integrated these actions in my app
        </PulseButton>
      </section>
    </div>
  );
};
