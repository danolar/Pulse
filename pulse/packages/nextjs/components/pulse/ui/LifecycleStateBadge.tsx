import type { LifecycleState } from "~~/types/pulse";
import { LIFECYCLE_LABELS } from "~~/types/pulse";

const lifecycleTone: Record<LifecycleState, "neutral" | "success" | "warning" | "accent"> = {
  CREATED: "neutral",
  ACTIVE: "success",
  EVALUATING: "warning",
  THRESHOLD_REACHED: "accent",
  BLOCKED: "warning",
};

type LifecycleStateBadgeProps = {
  state: LifecycleState;
};

export const LifecycleStateBadge = ({ state }: LifecycleStateBadgeProps) => {
  const tone = lifecycleTone[state];
  return (
    <span
      className={`badge badge-sm border-none ${
        tone === "success"
          ? "bg-success/15 text-success"
          : tone === "warning"
            ? "bg-warning/15 text-warning"
            : tone === "accent"
              ? "bg-accent/15 text-accent"
              : "bg-base-300 text-pulse-muted"
      }`}
    >
      {LIFECYCLE_LABELS[state]}
    </span>
  );
};
