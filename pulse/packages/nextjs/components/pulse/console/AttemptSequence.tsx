"use client";

import { Check, HelpCircle, Lock, X } from "lucide-react";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import { VERIFICATION_TYPE_LABELS } from "~~/constants/pulseProtocol";
import type { ProfileRole } from "~~/hooks/pulse/useProfileByAddress";
import { usePulseStore } from "~~/services/store/pulseStore";
import type { VerificationAttempt } from "~~/types/pulse";

type AttemptSequenceProps = {
  attempts: VerificationAttempt[];
  profileRole?: ProfileRole;
};

export const CommitRevealCaption = () => (
  <p className="mt-3 text-xs text-pulse-muted">
    Locked cards hide attempt type until the hash is revealed onchain for that window.
  </p>
);

export const AttemptSequence = ({ attempts, profileRole = "none" }: AttemptSequenceProps) => {
  const { mockRespondToAttempt, mockForceOpenAttempt } = usePulseStore();
  const hasExpiredUnopened = attempts.some(attempt => attempt.expiredUnopened);

  return (
    <section className="pulse-card p-5 sm:p-6">
      <div className="mb-4">
        <h2 className="pulse-section-title">Verification window</h2>
        <p className="mt-1 text-sm text-pulse-muted">
          Attempt types are commit-revealed onchain. You see each type only when its response window opens.
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {attempts.map((attempt, index) => (
          <article
            key={attempt.id}
            className="min-w-[11rem] flex-1 rounded-2xl border border-base-content/10 bg-base-200/60 p-4"
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
                {attempt.isActive && profileRole === "owner" ? (
                  <PulseButton
                    variant="secondary"
                    className="w-full btn-sm"
                    onClick={() => {
                      mockRespondToAttempt(attempt.id, attempt.verificationType);
                    }}
                  >
                    Respond
                  </PulseButton>
                ) : (
                  <p className="text-xs text-pulse-muted">Awaiting window</p>
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
        ))}
      </div>

      <CommitRevealCaption />

      {hasExpiredUnopened && profileRole === "requestor" ? (
        <PulseButton variant="ghost" className="mt-4" onClick={() => mockForceOpenAttempt()}>
          Force open expired attempt
        </PulseButton>
      ) : null}

      {hasExpiredUnopened && profileRole === "owner" ? (
        <p className="mt-4 text-xs text-pulse-muted">
          An attempt expired unopened. Authorized requestors can force-open if the keeper is unavailable.
        </p>
      ) : null}
    </section>
  );
};
