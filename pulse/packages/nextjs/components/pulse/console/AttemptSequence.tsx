"use client";

import { Check, HelpCircle, Lock, X } from "lucide-react";
import { PulseWorldIdButton } from "~~/components/pulse/world-id/PulseWorldIdButton";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import {
  WINDOW_SCHEDULE_FOOTNOTE,
  WINDOW_SCHEDULE_NOTE,
} from "~~/constants/explorerCopy";
import { VERIFICATION_TYPE_LABELS, worldIdActions } from "~~/constants/pulseProtocol";
import type { ProfileRole } from "~~/hooks/pulse/useProfileByAddress";
import { usePulseStore } from "~~/services/store/pulseStore";
import { LIFECYCLE_LABELS, type LifecycleState, type VerificationAttempt } from "~~/types/pulse";
import { notification } from "~~/utils/scaffold-eth/notification";
import type { PulseWorldIdVerification } from "~~/utils/worldIdProof";

type AttemptSequenceProps = {
  attempts: VerificationAttempt[];
  profileRole?: ProfileRole;
  lifecycle?: LifecycleState;
  epoch?: number;
  responseWindowHours?: number;
  profileKey?: string;
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

export const CommitRevealCaption = () => (
  <p className="mt-3 text-xs text-pulse-muted">
    Locked cards hide attempt type until the hash is revealed onchain for that window.
  </p>
);

const WindowStatusBar = ({
  lifecycle,
  epoch,
  responseWindowHours,
  activeAttemptIndex,
}: {
  lifecycle: LifecycleState;
  epoch: number;
  responseWindowHours?: number;
  activeAttemptIndex: number | null;
}) => (
  <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-base-content/10 bg-base-200/40 px-4 py-3 text-sm">
    <span className="badge badge-sm border-none bg-base-300">{LIFECYCLE_LABELS[lifecycle]}</span>
    <span className="text-pulse-muted">Epoch {epoch}</span>
    {activeAttemptIndex !== null ? (
      <>
        <span className="text-base-content/30">·</span>
        <span className="font-medium text-base-content">
          Attempt {activeAttemptIndex + 1} open
        </span>
        {responseWindowHours ? (
          <span className="text-pulse-muted">({responseWindowHours}h response window)</span>
        ) : null}
      </>
    ) : (
      <>
        <span className="text-base-content/30">·</span>
        <span className="text-pulse-muted">No open attempt</span>
      </>
    )}
  </div>
);

export const AttemptSequence = ({
  attempts,
  profileRole = "none",
  lifecycle = "CREATED",
  epoch = 0,
  responseWindowHours,
  profileKey = "",
}: AttemptSequenceProps) => {
  const { mockRespondToAttempt, mockForceOpenAttempt } = usePulseStore();
  const hasExpiredUnopened = attempts.some(attempt => attempt.expiredUnopened);
  const activeAttemptIndex = attempts.findIndex(attempt => attempt.isActive && attempt.status === "revealed");
  const isOwner = profileRole === "owner";
  const isRequestor = profileRole === "requestor";

  const respondToAttempt = (attempt: VerificationAttempt) => {
    mockRespondToAttempt(attempt.id, attempt.verificationType);
  };

  return (
    <section className="pulse-card p-5 sm:p-6">
      <div className="mb-4">
        <h2 className="pulse-section-title">Verification window</h2>
        <p className="mt-1 text-sm text-pulse-muted">
          Current epoch attempts — commit-revealed onchain. Owner responds during the open card.
        </p>
      </div>

      <WindowStatusBar
        lifecycle={lifecycle}
        epoch={epoch}
        responseWindowHours={responseWindowHours}
        activeAttemptIndex={activeAttemptIndex >= 0 ? activeAttemptIndex : null}
      />

      <p className="mb-4 text-xs leading-relaxed text-pulse-muted">
        {isOwner ? WINDOW_SCHEDULE_FOOTNOTE : WINDOW_SCHEDULE_NOTE}
      </p>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {attempts.length === 0 ? (
          <p className="text-sm text-pulse-muted">No attempts in this window yet.</p>
        ) : (
          attempts.map((attempt, index) => (
            <article
              key={attempt.id}
              className={`min-w-[11rem] flex-1 rounded-2xl border p-4 transition-colors ${
                attempt.isActive && attempt.status === "revealed"
                  ? "border-primary/40 bg-primary/5"
                  : "border-base-content/10 bg-base-200/60"
              }`}
            >
              <p className="pulse-label mb-3">Attempt {index + 1}</p>

              {attempt.status === "locked" ? (
                <div className="flex flex-col items-center gap-2 py-4 text-center">
                  <Lock className="h-5 w-5 text-pulse-muted" />
                  <HelpCircle className="h-4 w-4 text-pulse-muted" />
                  <p className="text-sm text-pulse-muted">Committed · hidden until reveal</p>
                </div>
              ) : null}

              {attempt.status === "revealed" ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-base-content">
                    {attempt.verificationType
                      ? VERIFICATION_TYPE_LABELS[attempt.verificationType]
                      : "Pending reveal"}
                  </p>
                  {attempt.isActive && isOwner ? (
                    attempt.verificationType === "WORLD_ID" && profileKey ? (
                      <PulseWorldIdButton
                        level="device"
                        action={worldIdActions.checkin(profileKey)}
                        signal={profileKey}
                        label="Respond · World ID"
                        onVerified={runVerifiedAction(() => respondToAttempt(attempt))}
                      />
                    ) : (
                      <PulseButton
                        variant="secondary"
                        className="w-full btn-sm"
                        onClick={() => respondToAttempt(attempt)}
                      >
                        Respond
                      </PulseButton>
                    )
                  ) : (
                    <p className="text-xs text-pulse-muted">
                      {attempt.isActive ? "Owner wallet required to respond" : "Awaiting window"}
                    </p>
                  )}
                </div>
              ) : null}

              {attempt.status === "completed" ? (
                <div className="flex flex-col items-center gap-2 py-3">
                  {attempt.result === "success" ? (
                    <Check className="h-6 w-6 text-success" />
                  ) : (
                    <X className="h-6 w-6 text-error" />
                  )}
                  <p className="text-sm capitalize text-base-content">{attempt.result ?? "completed"}</p>
                  <p className="text-xs text-pulse-muted">
                    {attempt.result === "success" ? "Window reset on proof of life" : "Weight accrued"}
                  </p>
                </div>
              ) : null}
            </article>
          ))
        )}
      </div>

      <CommitRevealCaption />

      {hasExpiredUnopened && isRequestor ? (
        <PulseButton variant="ghost" className="mt-4" onClick={() => mockForceOpenAttempt()}>
          Force open expired attempt
        </PulseButton>
      ) : null}

      {hasExpiredUnopened && isOwner ? (
        <p className="mt-4 text-xs text-pulse-muted">
          An attempt expired unopened. Authorized requestors can force-open if the keeper is unavailable.
        </p>
      ) : null}
    </section>
  );
};
