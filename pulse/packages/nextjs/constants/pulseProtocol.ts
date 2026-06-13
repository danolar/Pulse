import type { LifecycleState, VerificationType } from "~~/types/pulse";

/** World ID action strings per specs §2 / §7. */
export const worldIdActions = {
  createProfile: (profileKey: string) => `create-${profileKey}`,
  bindOrb: (profileKey: string) => `bind-${profileKey}`,
  checkin: (profileKey: string) => `checkin-${profileKey}`,
  requestExtension: (profileKey: string) => `extension-${profileKey}`,
  block: (profileKey: string) => `block-${profileKey}`,
  resurrect: (profileKey: string) => `resurrect-${profileKey}`,
  claimRequestorSlot: (ownerKey: string, requestorAddress: string) =>
    `claim-${ownerKey}-${requestorAddress.toLowerCase()}`,
  requestEvaluation: (profileKey: string) => `evaluate-${profileKey}`,
};

export const VERIFICATION_TYPE_LABELS: Record<VerificationType, string> = {
  WORLD_ID: "World ID",
  ONCHAIN_TX: "Onchain activity (CRE)",
  AI_AGENT: "AI agent (Confidential AI)",
  VOICE_AGENT: "Voice check-in (Twilio)",
};

export const LIFECYCLE_DESCRIPTIONS: Record<LifecycleState, string> = {
  CREATED: "Profile registered. Finish setup to enter active monitoring.",
  ACTIVE: "Passive signals accumulate silently. Act when an attempt opens or you choose to check in.",
  EVALUATING: "Authorized evaluation in progress — attempt frequency intensifies.",
  THRESHOLD_REACHED: "Unresponsiveness threshold crossed. Consumers may act after validating Walrus evidence.",
  BLOCKED: "Owner froze evaluation with Orb verification.",
};

export const CONFIG_FIELD_HINTS = {
  windowDuration: "Evaluation window length (days). Random attempts are scheduled inside this period.",
  attemptsPerWindow: "Number of randomized verification attempts per window.",
  responseWindow: "Hours the owner has to respond once an attempt opens.",
  missedAttemptWeight: "Unresponsiveness weight added when an attempt expires unanswered.",
  threshold: "Total unresponsiveness weight that emits ThresholdReached.",
} as const;

export const formatSignalWeight = (direction: "positive" | "negative", weight: number): string => {
  if (direction === "positive" && weight === 0) {
    return "Window reset (proof of life)";
  }
  if (direction === "negative" && weight === 0) {
    return "Logged (no weight change)";
  }
  if (direction === "negative") {
    return `+${weight} toward threshold`;
  }
  return `+${weight} toward threshold`;
};
