"use client";

import { useAccount } from "wagmi";
import { PulseWorldIdButton } from "~~/components/pulse/world-id/PulseWorldIdButton";
import { ConnectToActNote } from "~~/components/pulse/explorer/ProfileBanners";
import { worldIdActions } from "~~/constants/pulseProtocol";
import type { ProfileRole } from "~~/hooks/pulse/useProfileByAddress";
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
  profileAddress: string;
  role: ProfileRole;
  lifecycle: LifecycleState;
  orbBound: boolean;
  profileId: string | null;
};

export const ProfileActions = ({
  profileAddress,
  role,
  lifecycle,
  orbBound,
  profileId,
}: ProfileActionsProps) => {
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

  const profileKey = profileId ?? profileAddress;
  const ownerActionsEnabled = lifecycle === "ACTIVE" || lifecycle === "EVALUATING";
  const canBlock = orbBound && ownerActionsEnabled;
  const canResurrect = orbBound && lifecycle === "THRESHOLD_REACHED";

  const requestorSlot = address
    ? requestors.find(r => r.address.toLowerCase() === address.toLowerCase())
    : undefined;
  const canClaimSlot = Boolean(requestorSlot?.authorized && !requestorSlot.claimed);
  const canRequestEvaluation = role === "requestor" && lifecycle === "ACTIVE";

  if (role === "none") {
    return (
      <section className="pulse-card p-5 sm:p-6">
        <h2 className="pulse-section-title mb-3">Profile actions</h2>
        <ConnectToActNote />
        {canClaimSlot ? (
          <div className="mt-4">
            <WorldIDActionButton
              level="device"
              action={worldIdActions.claimRequestorSlot(profileKey, address ?? "")}
              signal={profileKey}
              label="Claim requestor slot"
              onVerified={runVerifiedAction(v => mockClaimRequestorSlot(address ?? "", v))}
            />
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section className="pulse-card p-5 sm:p-6">
      <h2 className="pulse-section-title mb-1">
        {role === "owner" ? "Owner actions" : "Requestor actions"}
      </h2>
      <p className="mb-4 text-sm text-pulse-muted">
        {role === "owner"
          ? "World ID–gated writes for this profile."
          : "Verified requestor actions for this profile."}
      </p>

      {role === "owner" ? (
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
      ) : (
        <WorldIDActionButton
          level="device"
          action={worldIdActions.requestEvaluation(profileKey)}
          signal={profileKey}
          label="Ask Pulse to check on this profile"
          disabled={!canRequestEvaluation}
          onVerified={runVerifiedAction(mockRequestEvaluation)}
        />
      )}
    </section>
  );
};
