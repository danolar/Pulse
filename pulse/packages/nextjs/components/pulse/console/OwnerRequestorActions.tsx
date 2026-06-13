"use client";

import { PulseWorldIdButton } from "~~/components/pulse/world-id/PulseWorldIdButton";
import { usePulseStore } from "~~/services/store/pulseStore";
import type { ActingRole, LifecycleState } from "~~/types/pulse";

type OwnerRequestorActionsProps = {
  actingAs: ActingRole;
  lifecycle: LifecycleState;
  orbBound: boolean;
  profileId: string | null;
};

export const OwnerRequestorActions = ({ actingAs, lifecycle, orbBound, profileId }: OwnerRequestorActionsProps) => {
  const { mockCheckIn, mockRequestExtension, mockBlock, mockResurrect, mockRequestEvaluation } = usePulseStore();

  const ownerActionsEnabled = lifecycle === "ACTIVE" || lifecycle === "EVALUATING";
  const canBlock = orbBound && (lifecycle === "ACTIVE" || lifecycle === "EVALUATING");
  const canResurrect = orbBound && lifecycle === "THRESHOLD_REACHED";

  return (
    <section className="pulse-card p-5 sm:p-6">
      <h2 className="mb-4 text-base font-semibold text-base-content">Owner / requestor actions</h2>

      {actingAs === "owner" ? (
        <div className="flex flex-wrap gap-2">
          {ownerActionsEnabled ? (
            <>
              <PulseWorldIdButton
                level="device"
                action="pulse-checkin"
                signal={profileId ?? "pulse-profile"}
                label="Check In"
                onVerified={() => {
                  // TODO: wire to PulseOracle.checkin(...)
                  mockCheckIn();
                }}
              />
              <PulseWorldIdButton
                level="device"
                action="pulse-extension"
                signal={profileId ?? "pulse-profile"}
                label="Request Extension"
                onVerified={() => {
                  // TODO: wire to PulseOracle.requestExtension(...)
                  mockRequestExtension();
                }}
              />
            </>
          ) : null}

          {canBlock ? (
            <PulseWorldIdButton
              level="orb"
              action="pulse-block"
              signal={profileId ?? "pulse-profile"}
              label="Block"
              onVerified={() => {
                // TODO: wire to PulseOracle.block(...)
                mockBlock();
              }}
            />
          ) : null}

          {canResurrect ? (
            <PulseWorldIdButton
              level="orb"
              action="pulse-resurrect"
              signal={profileId ?? "pulse-profile"}
              label="Resurrect"
              onVerified={() => {
                // TODO: wire to PulseOracle.resurrect(...)
                mockResurrect();
              }}
            />
          ) : null}

          {!ownerActionsEnabled && !canBlock && !canResurrect ? (
            <p className="text-sm text-pulse-muted">No owner actions available for the current lifecycle state.</p>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <PulseWorldIdButton
            level="device"
            action="pulse-evaluation"
            signal={profileId ?? "pulse-profile"}
            label="Request Evaluation"
            onVerified={() => {
              // TODO: wire to PulseOracle.requestEvaluation(...)
              mockRequestEvaluation();
            }}
          />
        </div>
      )}
    </section>
  );
};
