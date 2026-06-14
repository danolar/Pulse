"use client";

import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import { RandomnessAgentBlock } from "~~/components/pulse/setup/rhythm/RandomnessAgentBlock";
import { CONFIG_FIELD_HINTS } from "~~/constants/pulseProtocol";
import { DEMO_RHYTHM_CONFIG, describeMonitoringRhythm } from "~~/constants/monitoringProfiles";
import type { RandomnessAgentConfig } from "~~/types/consumer";
import type { ProfileConfig } from "~~/types/pulse";

type RhythmFieldConfig = {
  field: keyof ProfileConfig;
  label: string;
  unit: string;
  min?: number;
  step?: number;
};

const RHYTHM_GROUPS: { title: string; description: string; fields: RhythmFieldConfig[] }[] = [
  {
    title: "Monitoring window",
    description: "How long each epoch runs and how many verification attempts it contains.",
    fields: [
      { field: "windowDuration", label: "Window duration", unit: "days", min: 1, step: 1 },
      { field: "attemptsPerWindow", label: "Attempts per window", unit: "count", min: 1, step: 1 },
    ],
  },
  {
    title: "Response & accrual",
    description: "Time to respond when an attempt opens, and weight added when one is missed.",
    fields: [
      { field: "responseWindow", label: "Response window", unit: "hours", min: 1, step: 1 },
      { field: "missedAttemptWeight", label: "Missed attempt weight", unit: "points", min: 1, step: 1 },
    ],
  },
  {
    title: "Threshold",
    description: "Total accumulated weight that triggers the onchain outcome event.",
    fields: [{ field: "threshold", label: "Threshold", unit: "points", min: 1, step: 5 }],
  },
];

type RhythmNumberFieldProps = {
  label: string;
  unit: string;
  value: number;
  min: number;
  step: number;
  hint?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
};

const RhythmNumberField = ({
  label,
  unit,
  value,
  min,
  step,
  hint,
  disabled,
  onChange,
}: RhythmNumberFieldProps) => {
  const clamp = (next: number) => Math.max(min, next);

  return (
    <div className="rounded-2xl border border-base-content/10 bg-base-100/60 p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-base-content">{label}</p>
          <p className="text-xs text-pulse-muted">{unit}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <PulseButton
          type="button"
          variant="secondary"
          className="btn-square h-10 w-10 min-h-10 shrink-0 rounded-xl p-0"
          disabled={disabled || value <= min}
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(clamp(value - step))}
        >
          <Minus className="h-4 w-4" />
        </PulseButton>
        <input
          type="number"
          min={min}
          step={step}
          disabled={disabled}
          value={value}
          className="input input-bordered h-10 min-h-10 flex-1 rounded-xl text-center font-mono text-base tabular-nums"
          onChange={event => onChange(clamp(Number(event.target.value) || min))}
        />
        <PulseButton
          type="button"
          variant="secondary"
          className="btn-square h-10 w-10 min-h-10 shrink-0 rounded-xl p-0"
          disabled={disabled}
          aria-label={`Increase ${label}`}
          onClick={() => onChange(value + step)}
        >
          <Plus className="h-4 w-4" />
        </PulseButton>
      </div>
      {hint ? <p className="mt-2 text-xs leading-relaxed text-pulse-muted">{hint}</p> : null}
    </div>
  );
};

type ConfigFormProps = {
  disabled?: boolean;
  draftConfig: ProfileConfig;
  onChange: (config: ProfileConfig) => void;
};

const ConfigForm = ({ disabled, draftConfig, onChange }: ConfigFormProps) => {
  const updateField = (field: keyof ProfileConfig, value: number) => {
    onChange({ ...draftConfig, [field]: value });
  };

  return (
    <div className="space-y-6">
      {RHYTHM_GROUPS.map(group => (
        <div key={group.title}>
          <h3 className="mb-1 text-sm font-medium text-base-content">{group.title}</h3>
          <p className="mb-3 text-xs text-pulse-muted">{group.description}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {group.fields.map(({ field, label, unit, min = 1, step = 1 }) => (
              <RhythmNumberField
                key={field}
                label={label}
                unit={unit}
                value={draftConfig[field]}
                min={min}
                step={step}
                disabled={disabled}
                hint={CONFIG_FIELD_HINTS[field]}
                onChange={value => updateField(field, value)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const NotificationTargetField = ({
  disabled,
  value,
  onChange,
}: {
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="rounded-2xl border border-base-content/10 bg-base-100/60 p-4">
    <label className="form-control">
      <span className="mb-1 text-sm font-medium text-base-content">Notification target</span>
      <span className="mb-3 block text-xs text-pulse-muted">Optional contract for threshold notifications.</span>
      <input
        className="input input-bordered h-10 min-h-10 w-full rounded-xl font-mono text-sm"
        placeholder="0x… IThresholdConsumer (optional)"
        value={value}
        disabled={disabled}
        onChange={event => onChange(event.target.value)}
      />
      <span className="mt-2 text-xs leading-relaxed text-pulse-muted">
        Leave empty to rely on ThresholdReached events only.
      </span>
    </label>
  </div>
);

const PlainLanguageSummary = ({ config }: { config: ProfileConfig }) => (
  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
    <p className="pulse-label mb-1">Cadence summary</p>
    <p className="text-sm leading-relaxed text-pulse-muted">{describeMonitoringRhythm(config)}</p>
  </div>
);

type StageRhythmProps = {
  disabled: boolean;
  initialConfig: ProfileConfig;
  initialNotificationTarget?: string | null;
  initialRandomnessAgent: RandomnessAgentConfig;
  onSave: (config: ProfileConfig, notificationTarget: string | null, randomnessAgent: RandomnessAgentConfig) => void;
};

export const StageRhythm = ({
  disabled,
  initialConfig,
  initialNotificationTarget = null,
  initialRandomnessAgent,
  onSave,
}: StageRhythmProps) => {
  const [draftConfig, setDraftConfig] = useState<ProfileConfig>(initialConfig);
  const [notificationTarget, setNotificationTarget] = useState(initialNotificationTarget ?? "");
  const [randomnessAgent, setRandomnessAgent] = useState<RandomnessAgentConfig>(initialRandomnessAgent);
  const [isDemoPreset, setIsDemoPreset] = useState(false);

  useEffect(() => {
    setDraftConfig(initialConfig);
  }, [initialConfig]);

  useEffect(() => {
    setNotificationTarget(initialNotificationTarget ?? "");
  }, [initialNotificationTarget]);

  useEffect(() => {
    setRandomnessAgent(initialRandomnessAgent);
  }, [initialRandomnessAgent]);

  const applyDemoPreset = () => {
    setDraftConfig(DEMO_RHYTHM_CONFIG);
    setIsDemoPreset(true);
  };

  const handleConfigChange = (config: ProfileConfig) => {
    setDraftConfig(config);
    setIsDemoPreset(false);
  };

  const handleSave = () => {
    const trimmedTarget = notificationTarget.trim();
    onSave(draftConfig, trimmedTarget ? trimmedTarget : null, randomnessAgent);
  };

  return (
    <section className={`pulse-card space-y-6 p-5 sm:p-6 ${disabled ? "opacity-60" : ""}`}>
      <div>
        <h2 className="pulse-section-title">Monitoring rhythm</h2>
        <p className="mt-1 text-sm text-pulse-muted">
          Window cadence, attempt frequency, response time, missed-attempt weight, and threshold.
        </p>
      </div>

      <ConfigForm disabled={disabled} draftConfig={draftConfig} onChange={handleConfigChange} />

      <NotificationTargetField
        disabled={disabled}
        value={notificationTarget}
        onChange={value => {
          setNotificationTarget(value);
        }}
      />

      <PlainLanguageSummary config={draftConfig} />

      <RandomnessAgentBlock
        disabled={disabled}
        value={randomnessAgent}
        onChange={setRandomnessAgent}
      />

      <div className="flex flex-wrap items-center gap-3">
        <PulseButton variant="secondary" disabled={disabled} onClick={applyDemoPreset}>
          Load demo preset
        </PulseButton>
        {isDemoPreset ? (
          <span className="text-xs text-pulse-muted">Compressed values for testing</span>
        ) : null}
      </div>

      <PulseButton disabled={disabled} onClick={handleSave}>
        Save rhythm configuration
      </PulseButton>
    </section>
  );
};
