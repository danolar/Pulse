"use client";

import { useAccount } from "wagmi";
import { PulseWorldIdButton } from "~~/components/pulse/world-id/PulseWorldIdButton";
import { worldIdActions } from "~~/constants/pulseProtocol";
import { usePulseStore } from "~~/services/store/pulseStore";
import type { ActingRole, LifecycleState } from "~~/types/pulse";
import { notification } from "~~/utils/scaffold-eth/notification";
import type { PulseWorldIdVerification } from "~~/utils/worldIdProof";

type OwnerRequestorActionsProps = {
  actingAs: ActingRole;
  lifecycle: LifecycleState;
  orbBound: boolean;
  profileId: string | null;
};

const runVerifiedAction = (action: (verification: PulseWorldIdVerification) => void) => {
  return (verification: PulseWorldIdVerification) => {
    try {
      action(verification);
    } catch (error) {
      notification.error(error instanceof Error ? error.message : "Action rejected.");
    }
  };
};

export const OwnerRequestorActions = ({ actingAs, lifecycle, orbBound, profileId }: OwnerRequestorActionsProps) => {
  const { address } = useAccount();
  const {
    mockCheckIn,
    mockRequestExtension,
    mockBlock,
    mockResurrect,
    mockRequestEvaluation,
    mockClaimRequestorSlot,
    requestors,
  } = usePulseStore();

  const profileKey = profileId ?? address ?? "pulse-profile";
  const ownerActionsEnabled = lifecycle === "ACTIVE" || lifecycle === "EVALUATING";
  const canBlock = orbBound && (lifecycle === "ACTIVE" || lifecycle === "EVALUATING");
  const canResurrect = orbBound && lifecycle === "THRESHOLD_REACHED";

  const requestorSlot = address
    ? requestors.find(r => r.address.toLowerCase() === address.toLowerCase())
    : requestors[0];
  const canClaimSlot = Boolean(requestorSlot?.authorized && !requestorSlot.claimed);
  const canRequestEvaluation = Boolean(requestorSlot?.claimed) && lifecycle === "ACTIVE";

  return (
    <section className="pulse-card p-5 sm:p-6">
      <h2 className="mb-1 text-base font-semibold text-base-content">
        {actingAs === "owner" ? "Owner actions" : "Requestor actions"}
      </h2>
      <p className="mb-4 text-sm text-pulse-muted">
        {actingAs === "owner"
          ? "Device-level World ID for check-in and extension. Orb-level for block and resurrect."
          : "Authorize → claim slot (Device World ID) → request evaluation when coherent."}
      </p>

      {actingAs === "owner" ? (
        <div className="flex flex-wrap gap-2">
          {ownerActionsEnabled ? (
            <>
              <PulseWorldIdButton
                level="device"
                action={worldIdActions.checkin(profileKey)}
                signal={profileKey}
                label="Check in"
                onVerified={runVerifiedAction(v => mockCheckIn(v))}
              />
              <PulseWorldIdButton
                level="device"
                action={worldIdActions.requestExtension(profileKey)}
                signal={profileKey}
                label="Request extension"
                onVerified={runVerifiedAction(v => mockRequestExtension(v))}
              />
            </>
          ) : null}

          {canBlock ? (
            <PulseWorldIdButton
              level="orb"
              action={worldIdActions.block(profileKey)}
              signal={profileKey}
              label="Block evaluation"
              onVerified={runVerifiedAction(v => mockBlock(v))}
            />
          ) : null}

          {canResurrect ? (
            <PulseWorldIdButton
              level="orb"
              action={worldIdActions.resurrect(profileKey)}
              signal={profileKey}
              label="Resurrect profile"
              onVerified={runVerifiedAction(v => mockResurrect(v))}
            />
          ) : null}

          {!orbBound && ownerActionsEnabled ? (
            <p className="w-full text-xs text-pulse-muted">Bind Orb identity in setup to unlock block.</p>
          ) : null}

          {!ownerActionsEnabled && !canBlock && !canResurrect ? (
            <p className="text-sm text-pulse-muted">No owner actions for the current lifecycle state.</p>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {canClaimSlot && requestorSlot ? (
            <PulseWorldIdButton
              level="device"
              action={worldIdActions.claimRequestorSlot(profileKey, requestorSlot.address)}
              signal={requestorSlot.address}
              label="Claim requestor slot"
              onVerified={runVerifiedAction(v => mockClaimRequestorSlot(requestorSlot.address, v))}
            />
          ) : null}

          {canRequestEvaluation ? (
            <PulseWorldIdButton
              level="device"
              action={worldIdActions.requestEvaluation(profileKey)}
              signal={profileKey}
              label="Request evaluation"
              onVerified={runVerifiedAction(() => mockRequestEvaluation())}
            />
          ) : null}

          {!requestorSlot ? (
            <p className="text-sm text-pulse-muted">
              No authorized slot for this wallet. Add your address in setup (Step 4).
            </p>
          ) : null}

          {requestorSlot && !requestorSlot.claimed ? (
            <p className="text-xs text-pulse-muted">Slot authorized · pending World ID claim.</p>
          ) : null}

          {requestorSlot?.claimed && !canRequestEvaluation ? (
            <p className="text-xs text-pulse-muted">Evaluation available when profile lifecycle is Active.</p>
          ) : null}
        </div>
      )}
    </section>
  );
};
