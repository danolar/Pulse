"use client";

import { useEffect, useState } from "react";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import { CONFIG_FIELD_HINTS } from "~~/constants/pulseProtocol";
import {
  CUSTOM_MONITORING_PROFILE,
  MONITORING_PROFILE_PRESETS,
  describeMonitoringRhythm,
  inferMonitoringPresetId,
  type MonitoringProfilePresetId,
} from "~~/constants/monitoringProfiles";
import type { ProfileConfig } from "~~/types/pulse";

const CONFIG_FIELDS: Array<{ field: keyof ProfileConfig; label: string; unit: string }> = [
  { field: "windowDuration", label: "Window duration", unit: "days" },
  { field: "attemptsPerWindow", label: "Attempts per window", unit: "count" },
  { field: "responseWindow", label: "Response window", unit: "hours" },
  { field: "missedAttemptWeight", label: "Missed attempt weight", unit: "points" },
  { field: "threshold", label: "Threshold", unit: "points" },
];

type MonitoringWindowSetupProps = {
  disabled?: boolean;
  initialConfig: ProfileConfig;
  onSave: (config: ProfileConfig) => void;
};

export const MonitoringWindowSetup = ({ disabled, initialConfig, onSave }: MonitoringWindowSetupProps) => {
  const [selectedPresetId, setSelectedPresetId] = useState<MonitoringProfilePresetId>(() =>
    inferMonitoringPresetId(initialConfig),
  );
  const [draftConfig, setDraftConfig] = useState<ProfileConfig>(initialConfig);

  useEffect(() => {
    setDraftConfig(initialConfig);
    setSelectedPresetId(inferMonitoringPresetId(initialConfig));
  }, [initialConfig]);

  const isCustom = selectedPresetId === "custom";
  const activePreset =
    selectedPresetId === "custom"
      ? CUSTOM_MONITORING_PROFILE
      : MONITORING_PROFILE_PRESETS.find(preset => preset.id === selectedPresetId);

  const selectPreset = (presetId: MonitoringProfilePresetId) => {
    setSelectedPresetId(presetId);
    if (presetId === "custom") return;

    const preset = MONITORING_PROFILE_PRESETS.find(item => item.id === presetId);
    if (preset) setDraftConfig(preset.config);
  };

  const updateConfigField = (field: keyof ProfileConfig, value: string) => {
    setSelectedPresetId("custom");
    setDraftConfig(current => ({ ...current, [field]: Number(value) || 0 }));
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-base-content/10 bg-base-200/30 p-4">
        <p className="text-sm leading-relaxed text-pulse-muted">
          This step sets <span className="font-medium text-base-content">how often Pulse checks on you</span> — not
          which apps or wallets watch you (that comes next). Pick a monitoring profile or build a custom one.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {MONITORING_PROFILE_PRESETS.map(preset => {
          const selected = selectedPresetId === preset.id;

          return (
            <button
              key={preset.id}
              type="button"
              disabled={disabled}
              onClick={() => selectPreset(preset.id)}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                selected
                  ? "border-primary/50 bg-primary/10"
                  : "border-base-content/10 bg-base-200/40 hover:border-primary/30"
              } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <span className="mb-1 flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-base-content">{preset.name}</span>
                {preset.recommended ? (
                  <span className="badge badge-sm border-none bg-primary/15 text-primary">Recommended</span>
                ) : null}
              </span>
              <span className="block text-xs leading-relaxed text-pulse-muted">{preset.tagline}</span>
              <span className="mt-2 block font-mono text-[11px] text-pulse-muted">
                {preset.config.windowDuration}d · {preset.config.attemptsPerWindow} attempts ·{" "}
                {preset.config.responseWindow}h to respond
              </span>
            </button>
          );
        })}

        <button
          type="button"
          disabled={disabled}
          onClick={() => selectPreset("custom")}
          className={`rounded-2xl border p-4 text-left transition-colors sm:col-span-2 ${
            isCustom
              ? "border-primary/50 bg-primary/10"
              : "border-base-content/10 bg-base-200/40 hover:border-primary/30"
          } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
        >
          <span className="mb-1 block text-sm font-semibold text-base-content">{CUSTOM_MONITORING_PROFILE.name}</span>
          <span className="block text-xs leading-relaxed text-pulse-muted">{CUSTOM_MONITORING_PROFILE.tagline}</span>
        </button>
      </div>

      {!isCustom && activePreset ? (
        <div className="rounded-2xl border border-base-content/10 bg-base-200/40 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-pulse-muted">Profile summary</p>
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            {CONFIG_FIELDS.map(({ field, label, unit }) => (
              <div key={field}>
                <dt className="text-xs text-pulse-muted">{label}</dt>
                <dd className="font-medium text-base-content">
                  {draftConfig[field]} {unit}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CONFIG_FIELDS.map(({ field, label, unit }) => (
            <label key={field} className="form-control">
              <span className="label-text mb-1 text-sm text-pulse-muted">
                {label} ({unit})
              </span>
              <input
                type="number"
                min={1}
                className="input input-bordered rounded-2xl"
                value={draftConfig[field]}
                disabled={disabled}
                onChange={event => updateConfigField(field, event.target.value)}
              />
              <span className="mt-1 text-xs text-pulse-muted">{CONFIG_FIELD_HINTS[field]}</span>
            </label>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">How this works</p>
        <p className="text-sm leading-relaxed text-pulse-muted">{describeMonitoringRhythm(draftConfig)}</p>
        <p className="mt-2 text-xs text-pulse-muted">
          Responding in time with World ID or onchain activity resets accumulated weight for the current window.
        </p>
      </div>

      <PulseButton disabled={disabled} onClick={() => onSave(draftConfig)}>
        {isCustom ? "Save custom profile" : `Use ${activePreset?.name ?? "profile"}`}
      </PulseButton>
    </div>
  );
};
