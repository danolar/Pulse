export type VoiceConnectionPublic = {
  connected: boolean;
  profileOwnerAddress: string;
  phoneMasked: string | null;
  phoneLast4: string | null;
  verificationPending: boolean;
  validationCode: string | null;
  connectedAt: string | null;
};

export type VoiceConnectionRecord = {
  id: string;
  profileOwnerAddress: string;
  phoneEncrypted: string;
  status: "pending" | "verified" | "revoked";
  validationCode: string | null;
  connectedAt: string | null;
  revokedAt: string | null;
};

export type VoiceCallAttempt = {
  id: string;
  profileOwnerAddress: string;
  checkInCode: string;
  callSid: string | null;
  status: "pending" | "calling" | "completed" | "failed" | "missed";
  outcome: "success" | "failure" | "no_answer" | null;
  kind: "test" | "scheduled";
  createdAt: string;
  completedAt: string | null;
};

export type VoiceCallAttemptPublic = {
  id: string;
  checkInCode: string;
  status: VoiceCallAttempt["status"];
  outcome: VoiceCallAttempt["outcome"];
  kind: VoiceCallAttempt["kind"];
  callSid: string | null;
  createdAt: string;
  completedAt: string | null;
};
