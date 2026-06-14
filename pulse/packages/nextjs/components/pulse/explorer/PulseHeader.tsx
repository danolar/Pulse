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
  <PulseConsoleGauge
    accumulatedWeight={accumulatedWeight}
    threshold={threshold}
    lifecycle={lifecycle}
    epoch={epoch}
    layout="explorer"
  />
);
