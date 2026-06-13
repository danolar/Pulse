export type LifecycleState = "CREATED" | "ACTIVE" | "EVALUATING" | "THRESHOLD_REACHED" | "BLOCKED";

export type ActingRole = "owner" | "requestor";

export type ProfileConfig = {
  windowDuration: number;
  attemptsPerWindow: number;
  responseWindow: number;
  missedAttemptWeight: number;
  threshold: number;
};

export type SignalAdapter = {
  id: string;
  address: string;
  weight: number;
  label: string;
};

export type AuthorizedRequestor = {
  id: string;
  address: string;
};

export type AttemptVisualStatus = "locked" | "revealed" | "completed";

export type AttemptResult = "success" | "failure";

export type VerificationAttempt = {
  id: string;
  status: AttemptVisualStatus;
  verificationType?: string;
  result?: AttemptResult;
  isActive?: boolean;
  expiredUnopened?: boolean;
};

export type ConsoleSignal = {
  id: string;
  signalType: string;
  direction: "positive" | "negative";
  weight: number;
  timestamp: string;
  walrusBlobId: string;
};

export const DEFAULT_PROFILE_CONFIG: ProfileConfig = {
  windowDuration: 5,
  attemptsPerWindow: 3,
  responseWindow: 2,
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
