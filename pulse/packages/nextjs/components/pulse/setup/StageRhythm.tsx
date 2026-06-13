"use client";

import { useEffect, useState } from "react";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import { NumberField } from "~~/components/pulse/ui/NumberField";
import { CONFIG_FIELD_HINTS } from "~~/constants/pulseProtocol";
import { DEMO_RHYTHM_CONFIG, describeMonitoringRhythm } from "~~/constants/monitoringProfiles";
import type { ProfileConfig } from "~~/types/pulse";

const CONFIG_FIELDS: Array<{ field: keyof ProfileConfig; label: string; unit: string }> = [
  { field: "windowDuration", label: "Window duration", unit: "days" },
  { field: "attemptsPerWindow", label: "Attempts per window", unit: "count" },
  { field: "responseWindow", label: "Response window", unit: "hours" },
  { field: "missedAttemptWeight", label: "Missed attempt weight", unit: "points" },
  { field: "threshold", label: "Threshold", unit: "points" },
];

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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {CONFIG_FIELDS.map(({ field, label, unit }) => (
        <NumberField
          key={field}
          label={label}
          unit={unit}
          value={draftConfig[field]}
          disabled={disabled}
          hint={CONFIG_FIELD_HINTS[field]}
          onChange={value => updateField(field, value)}
        />
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
  <label className="form-control">
    <span className="label-text mb-1 text-sm text-pulse-muted">Notification target (advanced)</span>
    <input
      className="input input-bordered rounded-2xl font-mono text-sm"
      placeholder="0x… consumer contract (optional)"
      value={value}
      disabled={disabled}
      onChange={event => onChange(event.target.value)}
    />
    <span className="mt-1 text-xs text-pulse-muted">
      Empty = passive ThresholdReached event only. Set an IThresholdConsumer contract for an active push.
    </span>
  </label>
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
  onSave: (config: ProfileConfig, notificationTarget: string | null) => void;
};

export const StageRhythm = ({
  disabled,
  initialConfig,
  initialNotificationTarget = null,
  onSave,
}: StageRhythmProps) => {
  const [draftConfig, setDraftConfig] = useState<ProfileConfig>(initialConfig);
  const [notificationTarget, setNotificationTarget] = useState(initialNotificationTarget ?? "");
  const [isDemoPreset, setIsDemoPreset] = useState(false);

  useEffect(() => {
    setDraftConfig(initialConfig);
  }, [initialConfig]);

  useEffect(() => {
    setNotificationTarget(initialNotificationTarget ?? "");
  }, [initialNotificationTarget]);

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
    onSave(draftConfig, trimmedTarget ? trimmedTarget : null);
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

      <div className="flex flex-wrap items-center gap-3">
        <PulseButton variant="secondary" disabled={disabled} onClick={applyDemoPreset}>
          Load demo preset
        </PulseButton>
        {isDemoPreset ? (
          <StatusTagInline label="Real onchain values, compressed for Explorer testing" />
        ) : null}
      </div>

      <SaveConfigButton disabled={disabled} onClick={handleSave} />
    </section>
  );
};

const StatusTagInline = ({ label }: { label: string }) => (
  <span className="text-xs text-pulse-muted">{label}</span>
);

const SaveConfigButton = ({ disabled, onClick }: { disabled: boolean; onClick: () => void }) => (
  <PulseButton disabled={disabled} onClick={onClick}>
    Save configuration
  </PulseButton>
);
