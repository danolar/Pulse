"use client";

import { PulseWorldIdButton } from "~~/components/pulse/world-id/PulseWorldIdButton";
import { REQUESTOR_ACTIONS_NOTE } from "~~/constants/explorerCopy";
import { worldIdActions } from "~~/constants/pulseProtocol";
import { usePulseStore } from "~~/services/store/pulseStore";
import type { LifecycleState } from "~~/types/pulse";
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

type ProfileRequestorActionsProps = {
  profileKey: string;
  lifecycle: LifecycleState;
};

export const ProfileRequestorActions = ({ profileKey, lifecycle }: ProfileRequestorActionsProps) => {
  const { mockRequestEvaluation } = usePulseStore();
  const canRequestEvaluation = lifecycle === "ACTIVE";

  return (
    <section className="pulse-card p-5 sm:p-6">
      <h2 className="pulse-section-title mb-1">Requestor actions</h2>
      <p className="mb-4 text-sm text-pulse-muted">{REQUESTOR_ACTIONS_NOTE}</p>
      <PulseWorldIdButton
        level="device"
        action={worldIdActions.requestEvaluation(profileKey)}
        signal={profileKey}
        label="Ask Pulse to check on this profile"
        disabled={!canRequestEvaluation}
        onVerified={runVerifiedAction(mockRequestEvaluation)}
      />
    </section>
  );
};
