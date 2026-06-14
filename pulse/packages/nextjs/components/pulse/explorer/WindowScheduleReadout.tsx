"use client";

import { Lock } from "lucide-react";
import {
  WINDOW_SCHEDULE_FOOTNOTE,
  WINDOW_SCHEDULE_NOTE,
  WINDOW_SCHEDULE_TITLE,
} from "~~/constants/explorerCopy";
import { VERIFICATION_TYPE_LABELS } from "~~/constants/pulseProtocol";
import type { LifecycleState, VerificationAttempt } from "~~/types/pulse";
import { LIFECYCLE_LABELS } from "~~/types/pulse";

type WindowScheduleReadoutProps = {
  attempts: VerificationAttempt[];
  lifecycle: LifecycleState;
  epoch: number;
  attemptsPerWindow: number;
  responseWindowHours: number;
  windowDurationDays: number;
};

const scheduleStatusLabel = (attempt: VerificationAttempt): string => {
  if (attempt.status === "locked") return "Committed, type hidden";
  if (attempt.status === "completed") {
    return attempt.result === "success" ? "Closed, proof received" : "Closed, weight accrued";
  }
  if (attempt.isActive && attempt.status === "revealed") {
    return attempt.verificationType
      ? `Response window open (${VERIFICATION_TYPE_LABELS[attempt.verificationType]})`
      : "Response window open";
  }
  if (attempt.verificationType) return `Revealed (${VERIFICATION_TYPE_LABELS[attempt.verificationType]})`;
  return "Scheduled";
};

export const WindowScheduleReadout = ({
  attempts,
  lifecycle,
  epoch,
  attemptsPerWindow,
  responseWindowHours,
  windowDurationDays,
}: WindowScheduleReadoutProps) => {
  const openWindows = attempts.filter(a => a.isActive && a.status === "revealed").length;
  const completed = attempts.filter(a => a.status === "completed").length;
  const committed = attempts.filter(a => a.status === "locked").length;
  const scheduledTotal = Math.max(attempts.length, attemptsPerWindow);

  return (
    <section className="pulse-card p-5 sm:p-6">
      <h2 className="pulse-section-title">{WINDOW_SCHEDULE_TITLE}</h2>
      <p className="mt-1 text-sm leading-relaxed text-pulse-muted">{WINDOW_SCHEDULE_NOTE}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="badge badge-lg border-none bg-base-300">{LIFECYCLE_LABELS[lifecycle]}</span>
        <span className="badge badge-lg border-none bg-base-300">Epoch {epoch}</span>
        <span className="badge badge-lg border-none bg-base-300">{windowDurationDays}d window</span>
        <span className="badge badge-lg border-none bg-base-300">{responseWindowHours}h per check</span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl bg-base-200/60 p-3">
          <dt className="text-xs text-pulse-muted">Response windows open</dt>
          <dd className="text-lg font-medium tabular-nums">{openWindows}</dd>
        </div>
        <div className="rounded-xl bg-base-200/60 p-3">
          <dt className="text-xs text-pulse-muted">Closed</dt>
          <dd className="text-lg font-medium tabular-nums">{completed}</dd>
        </div>
        <div className="rounded-xl bg-base-200/60 p-3">
          <dt className="text-xs text-pulse-muted">Committed</dt>
          <dd className="text-lg font-medium tabular-nums">{committed}</dd>
        </div>
        <div className="rounded-xl bg-base-200/60 p-3">
          <dt className="text-xs text-pulse-muted">In sequence</dt>
          <dd className="text-lg font-medium tabular-nums">{scheduledTotal}</dd>
        </div>
      </dl>

      {attempts.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {attempts.map((attempt, index) => (
            <li
              key={attempt.id}
              className="flex flex-col gap-1 rounded-xl border border-base-content/10 bg-base-200/40 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="font-medium">Scheduled check {index + 1}</span>
              <span className="flex items-center gap-2 text-pulse-muted">
                {attempt.status === "locked" ? <Lock className="h-3.5 w-3.5 shrink-0" /> : null}
                {scheduleStatusLabel(attempt)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-pulse-muted">No scheduled check data indexed for this epoch yet.</p>
      )}

      <p className="mt-4 text-xs leading-relaxed text-pulse-muted">{WINDOW_SCHEDULE_FOOTNOTE}</p>
    </section>
  );
};
