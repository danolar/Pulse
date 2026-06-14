import type { ProfileConfig } from "~~/types/pulse";
import { DEFAULT_PROFILE_CONFIG } from "~~/types/pulse";

export type MonitoringProfilePresetId = "relaxed" | "standard" | "strict" | "custom";

export type MonitoringProfilePreset = {
  id: MonitoringProfilePresetId;
  name: string;
  tagline: string;
  recommended?: boolean;
  config: ProfileConfig;
};

export const MONITORING_PROFILE_PRESETS: MonitoringProfilePreset[] = [
  {
    id: "relaxed",
    name: "Relaxed",
    tagline: "Fewer check-ins and more time to respond. Suited to low-risk or long-horizon monitoring.",
    config: {
      windowDuration: 90,
      attemptsPerWindow: 3,
      responseWindow: 48,
      missedAttemptWeight: 12,
      threshold: 100,
    },
  },
  {
    id: "standard",
    name: "Standard",
    tagline: "Balanced rhythm for most profiles. The default Pulse recommends.",
    recommended: true,
    config: DEFAULT_PROFILE_CONFIG,
  },
  {
    id: "strict",
    name: "Strict",
    tagline: "More frequent attempts and faster weight accumulation. For high-stakes outcomes.",
    config: {
      windowDuration: 30,
      attemptsPerWindow: 6,
      responseWindow: 24,
      missedAttemptWeight: 20,
      threshold: 80,
    },
  },
];

export const CUSTOM_MONITORING_PROFILE: MonitoringProfilePreset = {
  id: "custom",
  name: "Custom",
  tagline: "Adjust every parameter to match your consumer or legal requirements.",
  config: DEFAULT_PROFILE_CONFIG,
};

const configsEqual = (a: ProfileConfig, b: ProfileConfig): boolean =>
  a.windowDuration === b.windowDuration &&
  a.attemptsPerWindow === b.attemptsPerWindow &&
  a.responseWindow === b.responseWindow &&
  a.missedAttemptWeight === b.missedAttemptWeight &&
  a.threshold === b.threshold;

export const inferMonitoringPresetId = (config: ProfileConfig): MonitoringProfilePresetId => {
  const match = MONITORING_PROFILE_PRESETS.find(preset => configsEqual(preset.config, config));
  return match?.id ?? "custom";
};

/** Compressed cadence for Explorer demos — valid onchain values, not production timing. */
export const DEMO_RHYTHM_CONFIG: ProfileConfig = {
  windowDuration: 1,
  attemptsPerWindow: 2,
  responseWindow: 1,
  missedAttemptWeight: 10,
  threshold: 25,
};

export const describeMonitoringRhythm = (config: ProfileConfig): string => {
  const maxMissedWeight = config.attemptsPerWindow * config.missedAttemptWeight;
  const reachesThresholdOnMissesOnly =
    maxMissedWeight >= config.threshold
      ? Math.ceil(config.threshold / config.missedAttemptWeight)
      : null;

  const missLine =
    reachesThresholdOnMissesOnly !== null
      ? `Missing about ${reachesThresholdOnMissesOnly} attempts in a row could reach the threshold (ignoring passive signals).`
      : "Missed attempts alone may not reach the threshold. Passive inactivity signals also count.";

  return [
    `Every ${config.windowDuration} days Pulse schedules ${config.attemptsPerWindow} random check-ins.`,
    `When one opens you have ${config.responseWindow} hours to respond.`,
    `Each missed attempt adds ${config.missedAttemptWeight} points toward a ${config.threshold}-point threshold.`,
    missLine,
  ].join(" ");
};
