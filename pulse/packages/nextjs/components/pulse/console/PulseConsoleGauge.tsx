"use client";

import { useEffect, useState } from "react";
import { CONSOLE_GAUGE_SIZE, ThresholdGauge } from "~~/components/pulse/gauge/ThresholdGauge";
import { LIFECYCLE_LABELS, type LifecycleState } from "~~/types/pulse";

const MOBILE_GAUGE_SIZE = 236;

type PulseConsoleGaugeProps = {
  accumulatedWeight: number;
  threshold: number;
  lifecycle: LifecycleState;
  epoch: number;
};

export const PulseConsoleGauge = ({ accumulatedWeight, threshold, lifecycle, epoch }: PulseConsoleGaugeProps) => {
  const [gaugeSize, setGaugeSize] = useState(CONSOLE_GAUGE_SIZE);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const updateSize = () => setGaugeSize(mediaQuery.matches ? MOBILE_GAUGE_SIZE : CONSOLE_GAUGE_SIZE);

    updateSize();
    mediaQuery.addEventListener("change", updateSize);
    return () => mediaQuery.removeEventListener("change", updateSize);
  }, []);

  const percentage = threshold > 0 ? Math.round((accumulatedWeight / threshold) * 100) : 0;
  const pulseDuration = lifecycle === "ACTIVE" ? Math.max(0.8, 2.4 - percentage / 100) : 3.6;
  const pulseOpacity = lifecycle === "ACTIVE" ? Math.max(0.35, 1 - percentage / 120) : 0.25;

  return (
    <section className="pulse-card overflow-hidden p-4 sm:p-8">
      <div className="flex flex-col items-center gap-6 sm:gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full justify-center">
          <ThresholdGauge
            value={accumulatedWeight}
            max={threshold}
            label="Weight / threshold"
            size={gaugeSize}
            showPulseLine
            pulseActive={lifecycle === "ACTIVE"}
            pulseDuration={pulseDuration}
            pulseOpacity={pulseOpacity}
          />
        </div>

        <div className="flex w-full flex-col items-center gap-3 text-center lg:items-start lg:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            <span className="badge badge-lg border-none bg-primary/10 text-primary">{LIFECYCLE_LABELS[lifecycle]}</span>
            <span className="badge badge-lg border-none bg-base-300 text-base-content">Epoch {epoch}</span>
          </div>
          <p className="max-w-md text-sm text-pulse-muted">
            Accumulated weight {accumulatedWeight} / {threshold}. Pulse animation stays active while monitoring and
            eases as the gauge approaches threshold.
          </p>
        </div>
      </div>
    </section>
  );
};
