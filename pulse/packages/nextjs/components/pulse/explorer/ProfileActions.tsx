"use client";

import { PulseWorldIdButton } from "~~/components/pulse/world-id/PulseWorldIdButton";
import { worldIdActions } from "~~/constants/pulseProtocol";
import { usePulseStore } from "~~/services/store/pulseStore";
import type { LifecycleState } from "~~/types/pulse";
import { notification } from "~~/utils/scaffold-eth/notification";
import type { PulseWorldIdVerification } from "~~/utils/worldIdProof";

const WorldIDActionButton = PulseWorldIdButton;

const runVerifiedAction = (action: (verification: PulseWorldIdVerification) => void) => {
  return (verification: PulseWorldIdVerification) => {
    try {
      action(verification);
    } catch (error) {
      notification.error(error instanceof Error ? error.message : "Action rejected.");
    }
  };
};

type ProfileActionsProps = {
  profileKey: string;
  lifecycle: LifecycleState;
  orbBound: boolean;
  hasActiveAttempt: boolean;
};

export const ProfileActions = ({
  profileKey,
  lifecycle,
  orbBound,
  hasActiveAttempt,
}: ProfileActionsProps) => {
  const { mockCheckIn, mockRequestExtension, mockBlock, mockResurrect } = usePulseStore();

  const ownerActionsEnabled = lifecycle === "ACTIVE" || lifecycle === "EVALUATING";
  const canBlock = orbBound && ownerActionsEnabled;
  const canResurrect = orbBound && lifecycle === "THRESHOLD_REACHED";

  return (
    <section className="pulse-card p-5 sm:p-6">
      <h2 className="pulse-section-title mb-1">Owner actions</h2>
      <p className="mb-4 text-sm text-pulse-muted">World ID gated actions for the profile owner.</p>

      {hasActiveAttempt ? (
        <p className="mb-4 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs leading-relaxed text-pulse-muted">
          An attempt is open. Respond in the verification window above first.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <WorldIDActionButton
          level="device"
          action={worldIdActions.checkin(profileKey)}
          signal={profileKey}
          label="Check in"
          disabled={!ownerActionsEnabled}
          onVerified={runVerifiedAction(mockCheckIn)}
        />
        <WorldIDActionButton
          level="device"
          action={worldIdActions.requestExtension(profileKey)}
          signal={profileKey}
          label="Request extension"
          disabled={!ownerActionsEnabled}
          onVerified={runVerifiedAction(mockRequestExtension)}
        />
        {orbBound ? (
          <>
            <WorldIDActionButton
              level="orb"
              action={worldIdActions.block(profileKey)}
              signal={profileKey}
              label="Freeze evaluation"
              disabled={!canBlock}
              onVerified={runVerifiedAction(mockBlock)}
            />
            <WorldIDActionButton
              level="orb"
              action={worldIdActions.resurrect(profileKey)}
              signal={profileKey}
              label="Reverse alarm"
              disabled={!canResurrect}
              onVerified={runVerifiedAction(mockResurrect)}
            />
          </>
        ) : null}
      </div>
    </section>
  );
};
