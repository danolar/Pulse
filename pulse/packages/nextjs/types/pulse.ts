export type LifecycleState = "CREATED" | "ACTIVE" | "EVALUATING" | "THRESHOLD_REACHED" | "BLOCKED";

export type ActingRole = "owner" | "requestor";

export type VerificationType = "WORLD_ID" | "ONCHAIN_TX" | "AI_AGENT" | "VOICE_AGENT";

export type ProfileConfig = {
  /** Evaluation window length in days (spec §5.1). */
  windowDuration: number;
  attemptsPerWindow: number;
  /** Response window per attempt in hours (spec §5.1). */
  responseWindow: number;
  missedAttemptWeight: number;
  threshold: number;
};

export type SignalAdapter = {
  id: string;
  /** Links adapter row to a pulse module when configured via setup. */
  moduleId?: string;
  address: string;
  weight: number;
  label: string;
};

export type AuthorizedRequestor = {
  id: string;
  address: string;
  /** Owner authorized this slot (authorizeRequestor). */
  authorized: boolean;
  /** Requestor completed World ID claim (claimRequestorSlot). */
  claimed: boolean;
};

export type AttemptVisualStatus = "locked" | "revealed" | "completed";

export type AttemptResult = "success" | "failure";

export type VerificationAttempt = {
  id: string;
  status: AttemptVisualStatus;
  verificationType?: VerificationType;
  result?: AttemptResult;
  isActive?: boolean;
  expiredUnopened?: boolean;
};

export type ConsoleSignal = {
  id: string;
  signalType: string;
  /** Negative = adds unresponsiveness weight; positive = proof-of-life (resets window in contract). */
  direction: "positive" | "negative";
  /** Magnitude added toward threshold (negative signals). Zero when direction is positive (window reset). */
  weight: number;
  timestamp: string;
  walrusBlobId: string;
};

/** Demo-friendly defaults; production profiles use longer windows (spec example: 60 days). */
export const DEFAULT_PROFILE_CONFIG: ProfileConfig = {
  windowDuration: 60,
  attemptsPerWindow: 5,
  responseWindow: 36,
  missedAttemptWeight: 15,
  threshold: 100,
};

export const LIFECYCLE_LABELS: Record<LifecycleState, string> = {
  CREATED: "Created",
  ACTIVE: "Active",
  EVALUATING: "Evaluating",
  THRESHOLD_REACHED: "Threshold reached",
  BLOCKED: "Blocked",
};
