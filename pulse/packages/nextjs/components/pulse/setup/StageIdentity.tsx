"use client";

import { useAccount } from "wagmi";
import { PulseWorldIdButton } from "~~/components/pulse/world-id/PulseWorldIdButton";
import { VerifiedCheck } from "~~/components/pulse/ui/VerifiedCheck";
import { WorldIDConfigStatus } from "~~/components/pulse/setup/identity/WorldIDConfigStatus";
import { DEV_TEST_SECTION_TITLE } from "~~/constants/explorerCopy";
import { worldIdActions } from "~~/constants/pulseProtocol";
import { usePulseStore } from "~~/services/store/pulseStore";
import { normalizeAddress } from "~~/utils/pulse/explorerAddress";
import { notification } from "~~/utils/scaffold-eth/notification";
import type { PulseWorldIdVerification } from "~~/utils/worldIdProof";

const runVerifiedAction = (action: (verification: PulseWorldIdVerification) => void) => {
  return (verification: PulseWorldIdVerification) => {
    try {
      action(verification);
    } catch (error) {
      notification.error(error instanceof Error ? error.message : "Action rejected.");
    }
  };
};

const WorldIDButton = PulseWorldIdButton;

type StageIdentityProps = {
  ownerAddress: string;
};

const DevTestStep = ({ ownerAddress }: StageIdentityProps) => {
  const { address: consumerAddress } = useAccount();
  const { deviceVerified, orbBound, mockCreateProfile, mockBindOrb } = usePulseStore();
  const ownerKey = normalizeAddress(ownerAddress);
  const canCreate = Boolean(consumerAddress);

  return (
    <section className="pulse-card border-dashed border-primary/30 p-5 sm:p-6">
      <p className="pulse-label mb-2 text-primary">{DEV_TEST_SECTION_TITLE}</p>
      <h2 className="pulse-section-title mb-4">Contract lab · create profile & bind Orb</h2>

      <div className="space-y-6">
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-medium">Device identity</h3>
            <VerifiedCheck verified={deviceVerified} label="Device bound" />
          </div>
          <p className="mb-3 text-sm text-pulse-muted">
            Mock createProfile for owner{" "}
            <span className="font-mono text-xs">{ownerKey}</span> with consumer wallet as msg.sender.
          </p>
          <WorldIDButton
            level="device"
            action={worldIdActions.createProfile(ownerKey)}
            signal={ownerKey}
            label="Verify & create profile"
            disabled={deviceVerified || !canCreate}
            onVerified={runVerifiedAction(v =>
              mockCreateProfile(ownerKey, consumerAddress!, v),
            )}
          />
        </div>

        <div className={deviceVerified ? "" : "opacity-60"}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-medium">Orb identity</h3>
            <VerifiedCheck verified={orbBound} label="Orb bound" />
          </div>
          <p className="mb-3 text-sm text-pulse-muted">
            Orb proof for freeze evaluation and reverse alarm (owner-only, highest assurance).
          </p>
          <WorldIDButton
            level="orb"
            action={worldIdActions.bindOrb(ownerKey)}
            signal={ownerKey}
            label="Bind Orb identity"
            disabled={!deviceVerified || orbBound}
            onVerified={runVerifiedAction(mockBindOrb)}
          />
        </div>
      </div>
    </section>
  );
};

export const StageIdentity = ({ ownerAddress }: StageIdentityProps) => (
  <div className="space-y-6">
    <WorldIDConfigStatus />
    <DevTestStep ownerAddress={ownerAddress} />
  </div>
);
