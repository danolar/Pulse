"use client";

import { useEffect, useState } from "react";
import { PulseMark } from "~~/components/pulse/brand/PulseMark";
import {
  ThresholdGauge,
  getGaugeStateForPercentage,
} from "~~/components/pulse/gauge/ThresholdGauge";
import { PULSE_GAUGE_STATES } from "~~/constants/pulseBrand";
import { LIFECYCLE_DESCRIPTIONS } from "~~/constants/pulseProtocol";
import { LIFECYCLE_LABELS, type LifecycleState } from "~~/types/pulse";

const EXPLORER_GAUGE_SIZE = 228;

type PulseConsoleGaugeProps = {
  accumulatedWeight: number;
  threshold: number;
  lifecycle: LifecycleState;
  epoch: number;
  layout?: "default" | "explorer";
};

export const PulseConsoleGauge = ({
  accumulatedWeight,
  threshold,
  lifecycle,
  epoch,
  layout = "default",
}: PulseConsoleGaugeProps) => {
  const isExplorer = layout === "explorer";
  const [gaugeSize, setGaugeSize] = useState(isExplorer ? EXPLORER_GAUGE_SIZE : 280);

  useEffect(() => {
    if (isExplorer) {
      setGaugeSize(EXPLORER_GAUGE_SIZE);
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const updateSize = () => setGaugeSize(mediaQuery.matches ? 236 : 280);

    updateSize();
    mediaQuery.addEventListener("change", updateSize);
    return () => mediaQuery.removeEventListener("change", updateSize);
  }, [isExplorer]);

  const percentage = threshold > 0 ? Math.round((accumulatedWeight / threshold) * 100) : 0;
  const gaugeState = getGaugeStateForPercentage(percentage);
  const pulseDuration =
    lifecycle === "ACTIVE" || lifecycle === "EVALUATING" ? Math.max(0.8, 2.4 - percentage / 100) : 3.6;
  const pulseOpacity =
    lifecycle === "ACTIVE" || lifecycle === "EVALUATING" ? Math.max(0.35, 1 - percentage / 120) : 0.25;
  const pulseActive = lifecycle === "ACTIVE" || lifecycle === "EVALUATING";

  return (
    <section className="pulse-card overflow-hidden p-5 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-5 sm:gap-6">
        <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-8 lg:gap-10">
          <aside className="mx-auto shrink-0 sm:mx-0">
            <ThresholdGauge
              value={accumulatedWeight}
              max={threshold}
              label="Unresponsiveness toward threshold"
              size={gaugeSize}
              showArcLabel={!isExplorer}
              showPulseLine
              showStateLabel={!isExplorer}
              pulseActive={pulseActive}
              pulseDuration={pulseDuration}
              pulseOpacity={pulseOpacity}
            />
          </aside>

          <div className="flex min-w-0 flex-col gap-4 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className={`pulse-state-badge pulse-state-${gaugeState.id}`}>{gaugeState.label}</span>
              <span className="badge badge-lg border-none bg-base-300 text-base-content">
                {LIFECYCLE_LABELS[lifecycle]}
              </span>
              <span className="badge badge-lg border-none bg-base-300 text-base-content">Epoch {epoch}</span>
            </div>

            <p className="text-sm leading-relaxed text-pulse-muted">{LIFECYCLE_DESCRIPTIONS[lifecycle]}</p>

            <div className="rounded-2xl border border-base-content/8 bg-base-200/40 px-4 py-3">
              <p className="pulse-label mb-1 text-pulse-muted">Unresponsiveness weight</p>
              <p className="font-mono text-lg tabular-nums text-base-content">
                {accumulatedWeight}
                <span className="text-pulse-muted"> / {threshold}</span>
              </p>
              <p className="mt-1 text-xs text-pulse-muted">{percentage}% of configured threshold</p>
            </div>
          </div>
        </div>

        <div className={`pulse-gauge-legend border-t border-base-content/5 pt-4 text-pulse-muted ${isExplorer ? "" : "sm:justify-start"}`}>
          {PULSE_GAUGE_STATES.map(state => (
            <span key={state.id} className="pulse-gauge-legend-item">
              <PulseMark size={14} color={state.color} tone="solid" />
              {state.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
