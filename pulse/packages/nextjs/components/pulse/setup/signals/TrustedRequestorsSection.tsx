"use client";

import { useState } from "react";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import { PulseWorldIdButton } from "~~/components/pulse/world-id/PulseWorldIdButton";
import { REQUESTORS_CONFIG_CALLOUT } from "~~/constants/explorerCopy";
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

export const TrustedRequestorsSection = () => {
  const { requestors, ownerAddress, mockAddRequestor, mockRemoveRequestor } = usePulseStore();
  const [draft, setDraft] = useState("");
  const ownerKey = ownerAddress ? normalizeAddress(ownerAddress) : "";

  const handleAdd = () => {
    if (!draft.trim()) return;
    try {
      mockAddRequestor(draft.trim());
      setDraft("");
    } catch (error) {
      notification.error(error instanceof Error ? error.message : "Could not add requestor.");
    }
  };

  return (
    <section className="pulse-card p-5 sm:p-6">
      <h2 className="pulse-section-title mb-1">Trusted requestors</h2>
      <p className="mb-2 text-sm text-pulse-muted">{REQUESTORS_CONFIG_CALLOUT}</p>
      <p className="mb-4 text-xs text-pulse-muted">
        Authorize requestors per profile in your app. Each requestor claims their slot with World ID.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          className="input input-bordered min-w-[12rem] flex-1 rounded-xl font-mono text-sm"
          placeholder="0x requestor address"
          value={draft}
          onChange={event => setDraft(event.target.value)}
        />
        <PulseButton variant="secondary" className="btn-sm" onClick={handleAdd}>
          Authorize
        </PulseButton>
      </div>

      {requestors.length === 0 ? (
        <p className="text-sm text-pulse-muted">No requestors authorized for this profile yet.</p>
      ) : (
        <ul className="divide-y divide-base-content/10 rounded-2xl border border-base-content/10">
          {requestors.map(requestor => (
            <li key={requestor.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-mono text-xs">{requestor.address}</p>
                <p className="text-xs text-pulse-muted">
                  {requestor.claimed ? "Claimed" : "Authorized · awaiting claim"}
                </p>
              </div>
              <div className="flex gap-2">
                {!requestor.claimed && ownerKey ? (
                  <PulseWorldIdButton
                    level="device"
                    action={worldIdActions.claimRequestorSlot(ownerKey, requestor.address)}
                    signal={requestor.address}
                    label="Simulate claim"
                    onVerified={runVerifiedAction(() =>
                      usePulseStore.getState().mockClaimRequestorSlot(requestor.address),
                    )}
                  />
                ) : null}
                <PulseButton
                  variant="ghost"
                  className="btn-xs"
                  onClick={() => mockRemoveRequestor(requestor.id)}
                >
                  Revoke
                </PulseButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
