"use client";

import { PulseConsoleGauge } from "~~/components/pulse/console/PulseConsoleGauge";
import type { LifecycleState } from "~~/types/pulse";

type PulseHeaderProps = {
  accumulatedWeight: number;
  threshold: number;
  lifecycle: LifecycleState;
  epoch: number;
};

export const PulseHeader = ({ accumulatedWeight, threshold, lifecycle, epoch }: PulseHeaderProps) => (
  <div className="space-y-2">
    <PulseConsoleGauge
      accumulatedWeight={accumulatedWeight}
      threshold={threshold}
      lifecycle={lifecycle}
      epoch={epoch}
      layout="explorer"
    />
    <p className="text-xs text-pulse-muted">
      Private progress — weight ratio is never shown in the public Explorer.
    </p>
  </div>
);
