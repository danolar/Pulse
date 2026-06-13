export const PULSE_LOGO_ON_LIGHT = "/brand/pulse-logo-on-light.svg";

/** Single source for landing hero tagline (Pulse Explorer). */
export const PULSE_TAGLINE = "Configurable onchain attestation oracle";

export const PULSE_COLORS = {
  accent: "#4C66FF",
  primary: "#4C66FF",
  galaxy: "#0B0B1E",
  purple: "#6F4CFF",
  blue: "#4C66FF",
  white: "#F8F6FF",
  accumulating: "#7D4490",
  unresponsive: "#9B3A6B",
  ink: "#0B0B1E",
  secondary: "#3D3854",
  muted: "#6B6580",
} as const;

export type PulseGaugeStateId = "safe" | "monitoring" | "accumulating" | "unresponsive";

export type PulseGaugeState = {
  id: PulseGaugeStateId;
  label: string;
  color: string;
};

export const PULSE_GAUGE_STATES: PulseGaugeState[] = [
  { id: "safe", label: "SAFE", color: PULSE_COLORS.blue },
  { id: "monitoring", label: "MONITORING", color: PULSE_COLORS.purple },
  { id: "accumulating", label: "ACCUMULATING", color: PULSE_COLORS.accumulating },
  { id: "unresponsive", label: "UNRESPONSIVE", color: PULSE_COLORS.unresponsive },
];

export const getGaugeStateForPercentage = (percentage: number): PulseGaugeState => {
  if (percentage >= 85) return PULSE_GAUGE_STATES[3];
  if (percentage >= 60) return PULSE_GAUGE_STATES[2];
  if (percentage >= 35) return PULSE_GAUGE_STATES[1];
  return PULSE_GAUGE_STATES[0];
};

export const gaugeColorForPercentage = (percentage: number): string =>
  getGaugeStateForPercentage(percentage).color;
