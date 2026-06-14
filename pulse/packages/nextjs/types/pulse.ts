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
  typeLabel?: string;
  capabilities?: "life" | "inactivity" | "both";
};

export type ConfiguredAdapter = {
  catalogId: string;
  name: string;
  typeLabel: string;
  adapterAddress: string;
  weight: number;
  capabilities: "life" | "inactivity" | "both";
  bindingStatus: "active" | "key-required" | "paused";
  isDecisionLayer?: boolean;
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

/** Decoded signal — visible only in consumer dashboard, not public Explorer. */
export type DecodedSignal = {
  id: string;
  signalType: string;
  /** Negative = adds unresponsiveness weight; positive = proof-of-life (resets window in contract). */
  direction: "positive" | "negative";
  /** Magnitude added toward threshold (negative signals). Zero when direction is positive (window reset). */
  weight: number;
  timestamp: string;
  walrusBlobId: string;
  adapterAddress?: string;
  consumerContextHash?: string;
};

/** Alias used in console/dashboard components. */
export type ConsoleSignal = DecodedSignal;

/** Public Explorer feed row — no weight, type, or threshold data. */
export type PublicSignalRecord = {
  id: string;
  blobId: string;
  timestamp: string;
  adapterAddress: string;
  consumerContextHash: string;
  status: "encrypted" | "decrypted";
};

export type PulseProfileSummary = {
  profileId: string;
  ownerAddress: string;
  consumerAddress: string;
  setupComplete: boolean;
  lifecycle: LifecycleState;
  accumulatedWeight: number;
  config: ProfileConfig;
  lastSignalAt: string | null;
};

export type PublicThresholdEvent = {
  id: string;
  kind: "THRESHOLD_REACHED" | "FINALIZED";
  timestamp: string;
  auditBlobId: string;
  epoch: number;
};

/** Public Explorer card — oracle results and activity, never progress toward threshold. */
export type PublicOwnerProfileView = {
  profileId: string;
  consumerContextHash: string;
  lifecycle: LifecycleState;
  adapterTypes: string[];
  signalCount: number;
  lastSignalAt: string | null;
  firstSignalAt: string | null;
  signalTimestamps: string[];
  thresholdEvents: PublicThresholdEvent[];
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
