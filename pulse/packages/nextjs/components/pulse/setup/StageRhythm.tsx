"use client";

import { MonitoringWindowSetup } from "~~/components/pulse/setup/MonitoringWindowSetup";
import type { ProfileConfig } from "~~/types/pulse";

type StageRhythmProps = {
  disabled: boolean;
  initialConfig: ProfileConfig;
  onSave: (config: ProfileConfig) => void;
};

export const StageRhythm = ({ disabled, initialConfig, onSave }: StageRhythmProps) => (
  <section className={`pulse-card p-5 sm:p-6 ${disabled ? "opacity-60" : ""}`}>
    <div className="mb-4">
      <h2 className="pulse-section-title">Monitoring rhythm</h2>
      <p className="mt-1 text-sm text-pulse-muted">
        Window duration, attempts, response time, missed-attempt weight, and threshold.
      </p>
    </div>
    <MonitoringWindowSetup disabled={disabled} initialConfig={initialConfig} onSave={onSave} />
  </section>
);
