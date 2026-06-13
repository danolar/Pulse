"use client";

import { Check, HelpCircle, Lock, X } from "lucide-react";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import { usePulseStore } from "~~/services/store/pulseStore";
import type { VerificationAttempt } from "~~/types/pulse";

type AttemptSequenceProps = {
  attempts: VerificationAttempt[];
};

export const AttemptSequence = ({ attempts }: AttemptSequenceProps) => {
  const { mockRespondToAttempt, mockForceOpenAttempt } = usePulseStore();
  const hasExpiredUnopened = attempts.some(attempt => attempt.expiredUnopened);

  return (
    <section className="pulse-card p-5 sm:p-6">
      <h2 className="mb-4 text-base font-semibold text-base-content">Attempt sequence</h2>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {attempts.map((attempt, index) => (
          <article
            key={attempt.id}
            className="min-w-[11rem] flex-1 rounded-2xl border border-base-content/10 bg-base-200/60 p-4"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-pulse-muted">Attempt {index + 1}</p>

            {attempt.status === "locked" ? (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <Lock className="h-5 w-5 text-pulse-muted" />
                <HelpCircle className="h-4 w-4 text-pulse-muted" />
                <p className="text-sm text-pulse-muted">Hidden until reveal</p>
              </div>
            ) : null}

            {attempt.status === "revealed" ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-base-content">{attempt.verificationType ?? "Unknown type"}</p>
                {attempt.isActive ? (
                  <PulseButton
                    variant="secondary"
                    className="w-full btn-sm"
                    onClick={() => {
                      // TODO: wire to PulseOracle.respondToAttempt(...)
                      mockRespondToAttempt(attempt.id);
                    }}
                  >
                    Respond
                  </PulseButton>
                ) : (
                  <p className="text-xs text-pulse-muted">Pending</p>
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
              </div>
            ) : null}
          </article>
        ))}
      </div>

      {hasExpiredUnopened ? (
        <PulseButton
          variant="ghost"
          className="mt-4"
          onClick={() => {
            // TODO: wire to PulseOracle.forceOpenAttempt(...)
            mockForceOpenAttempt();
          }}
        >
          Force Open Attempt
        </PulseButton>
      ) : null}
    </section>
  );
};
