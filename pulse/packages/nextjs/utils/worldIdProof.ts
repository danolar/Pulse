import type { IDKitResult } from "@worldcoin/idkit";

export type WorldIdProofLevel = "device" | "orb";

/** Legacy v3 identifiers and v4 credential identifiers mapped to Pulse levels. */
const DEVICE_CREDENTIALS = new Set(["device", "selfie", "face"]);
const ORB_CREDENTIALS = new Set(["orb", "proof_of_human"]);

export type ValidatedWorldIdProof = {
  level: WorldIdProofLevel;
  credential: string;
  nullifier: string;
  action: string;
  protocolVersion: string;
};

export type PulseWorldIdVerification = ValidatedWorldIdProof | { mock: true; level: WorldIdProofLevel };

export const isMockWorldIdVerification = (
  verification: PulseWorldIdVerification,
): verification is { mock: true; level: WorldIdProofLevel } => "mock" in verification;

const normalizeIdentifier = (identifier: string) => identifier.trim().toLowerCase();

export const getProofCredentialIdentifiers = (result: IDKitResult): string[] => {
  if ("session_id" in result && result.session_id) {
    throw new Error("Session proofs cannot be used for Pulse profile actions.");
  }

  if (!("responses" in result) || !Array.isArray(result.responses) || result.responses.length === 0) {
    throw new Error("World ID proof is missing credential responses.");
  }

  return result.responses.map(response => normalizeIdentifier(response.identifier));
};

export const getProofNullifier = (result: IDKitResult): string => {
  if ("session_id" in result && result.session_id) {
    throw new Error("Session proofs cannot be used for Pulse profile actions.");
  }

  if (!("responses" in result) || !Array.isArray(result.responses) || result.responses.length === 0) {
    throw new Error("World ID proof is missing a nullifier.");
  }

  const response = result.responses[0];
  const nullifier =
    "nullifier" in response && typeof response.nullifier === "string"
      ? response.nullifier
      : "session_nullifier" in response && Array.isArray(response.session_nullifier)
        ? response.session_nullifier[0]
        : null;

  if (!nullifier) {
    throw new Error("World ID proof is missing a nullifier.");
  }

  return nullifier;
};

export const getProofAction = (result: IDKitResult): string => {
  if ("action" in result && typeof result.action === "string") {
    return result.action;
  }
  return "";
};

const credentialMatchesLevel = (credential: string, level: WorldIdProofLevel): boolean => {
  if (level === "device") return DEVICE_CREDENTIALS.has(credential);
  return ORB_CREDENTIALS.has(credential);
};

export const validateWorldIdProof = (
  result: IDKitResult,
  expected: { level: WorldIdProofLevel; action: string },
): ValidatedWorldIdProof => {
  const credentials = getProofCredentialIdentifiers(result);
  const matchingCredential = credentials.find(credential => credentialMatchesLevel(credential, expected.level));

  if (!matchingCredential) {
    const received = credentials.join(", ") || "none";
    const required = expected.level === "device" ? "device / selfie" : "orb / proof_of_human";
    throw new Error(
      `This action requires ${expected.level.toUpperCase()} verification (${required}). Received: ${received}.`,
    );
  }

  const proofAction = getProofAction(result);
  if (proofAction && proofAction !== expected.action) {
    throw new Error(`World ID action mismatch. Expected "${expected.action}", got "${proofAction}".`);
  }

  return {
    level: expected.level,
    credential: matchingCredential,
    nullifier: getProofNullifier(result),
    action: proofAction || expected.action,
    protocolVersion: "protocol_version" in result ? result.protocol_version : "unknown",
  };
};

export const assertStoredNullifier = (
  verification: PulseWorldIdVerification,
  storedNullifier: string | null,
  level: WorldIdProofLevel,
) => {
  if (isMockWorldIdVerification(verification)) return;
  if (!storedNullifier) return;

  if (verification.level !== level) {
    throw new Error(`Expected ${level.toUpperCase()} verification for this action.`);
  }

  if (verification.nullifier !== storedNullifier) {
    throw new Error("World ID nullifier does not match the profile owner registered for this action.");
  }
};
