import { keccak256, stringToBytes } from "viem";

const DEFAULT_AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space";
const DEFAULT_PUBLISHER = "https://publisher.walrus-testnet.walrus.space";

/** Walrus blob IDs are base64url strings (may include `_` and `-`). */
const BLOB_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

export type PulseEvidenceType = "checkin" | "onchain-inactivity" | "roundtrip-test" | (string & {});

export type PulseEvidencePayload = {
  pulse: "signal-evidence";
  type: PulseEvidenceType;
  blobId: string;
  timestamp: string;
  profileId?: string;
};

export const getWalrusAggregatorUrl = () =>
  process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL?.replace(/\/$/, "") ?? DEFAULT_AGGREGATOR;

export const getWalrusPublisherUrl = () =>
  process.env.WALRUS_PUBLISHER_URL?.replace(/\/$/, "") ?? DEFAULT_PUBLISHER;

export const toWalrusBlobRef = (blobId: string) => `walrus://blob/${blobId}`;

/** Onchain bytes32 ref stored in PulseOracle events (keccak256 of the Walrus blob ID string). */
export const encodeWalrusRefForChain = (blobId: string): `0x${string}` => keccak256(stringToBytes(blobId));

/** Resolve a chain ref back to a Walrus blob ID using known candidates (demo blobs, session uploads). */
export const resolveWalrusBlobIdFromChain = (chainRef: string, knownBlobIds: string[]): string | null => {
  const normalized = chainRef.toLowerCase();
  for (const blobId of knownBlobIds) {
    if (encodeWalrusRefForChain(blobId).toLowerCase() === normalized) {
      return blobId;
    }
  }
  return null;
};

export const buildPulseEvidencePayload = (params: {
  type: PulseEvidenceType;
  blobId: string;
  profileId?: string;
  timestamp?: string;
}): PulseEvidencePayload => ({
  pulse: "signal-evidence",
  type: params.type,
  blobId: params.blobId,
  timestamp: params.timestamp ?? new Date().toISOString(),
  ...(params.profileId ? { profileId: params.profileId } : {}),
});

/** Accepts raw blob IDs or `walrus://blob/<id>` refs from the mock store. */
export const parseWalrusBlobId = (ref: string): string | null => {
  const trimmed = ref.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("walrus://blob/")) {
    const blobId = trimmed.slice("walrus://blob/".length);
    return BLOB_ID_PATTERN.test(blobId) ? blobId : null;
  }

  if (BLOB_ID_PATTERN.test(trimmed) && trimmed.length >= 20) {
    return trimmed;
  }

  return null;
};

export const getWalrusBlobUrl = (blobId: string) => `${getWalrusAggregatorUrl()}/v1/blobs/${blobId}`;

export const formatWalrusEvidence = (bytes: ArrayBuffer): { text: string; isJson: boolean } => {
  const text = new TextDecoder().decode(bytes);
  try {
    return { text: JSON.stringify(JSON.parse(text), null, 2), isJson: true };
  } catch {
    return { text, isJson: false };
  }
};

type WalrusUploadResponse = {
  newlyCreated?: { blobObject?: { blobId?: string } };
  alreadyCertified?: { blobId?: string };
};

const parseWalrusUploadBlobId = (json: WalrusUploadResponse): string | null =>
  json.newlyCreated?.blobObject?.blobId ?? json.alreadyCertified?.blobId ?? null;

/** PUT JSON evidence to Walrus testnet publisher. */
export const uploadWalrusJson = async (
  payload: PulseEvidencePayload | Record<string, unknown>,
  options?: { epochs?: number; publisherUrl?: string },
): Promise<string> => {
  const publisher = options?.publisherUrl ?? getWalrusPublisherUrl();
  const response = await fetch(`${publisher}/v1/blobs?epochs=${options?.epochs ?? 1}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Walrus upload failed HTTP ${response.status}`);
  }

  const json = (await response.json()) as WalrusUploadResponse;
  const blobId = parseWalrusUploadBlobId(json);
  if (!blobId) {
    throw new Error(`Walrus upload response missing blobId: ${JSON.stringify(json)}`);
  }

  return blobId;
};

/** GET blob bytes from Walrus aggregator. */
export const fetchWalrusBlob = async (blobId: string, aggregatorUrl?: string): Promise<ArrayBuffer> => {
  const aggregator = aggregatorUrl ?? getWalrusAggregatorUrl();
  const response = await fetch(`${aggregator}/v1/blobs/${blobId}`);

  if (!response.ok) {
    throw new Error(`Walrus read failed HTTP ${response.status} for ${blobId}`);
  }

  return response.arrayBuffer();
};

export type UploadedPulseEvidence = {
  blobId: string;
  ref: string;
  chainRef: `0x${string}`;
  payload: PulseEvidencePayload;
};

/**
 * Upload standard Pulse evidence JSON to Walrus.
 * Returns blobId + keccak chain ref for PulseOracle.reportSignal.
 */
export const uploadPulseEvidence = async (params: {
  type: PulseEvidenceType;
  profileId?: string;
  epochs?: number;
}): Promise<UploadedPulseEvidence> => {
  const timestamp = new Date().toISOString();
  const body = {
    pulse: "signal-evidence" as const,
    type: params.type,
    timestamp,
    ...(params.profileId ? { profileId: params.profileId } : {}),
  };

  const blobId = await uploadWalrusJson(body, { epochs: params.epochs });
  const payload = buildPulseEvidencePayload({
    type: params.type,
    blobId,
    profileId: params.profileId,
    timestamp,
  });

  return {
    blobId,
    ref: toWalrusBlobRef(blobId),
    chainRef: encodeWalrusRefForChain(blobId),
    payload,
  };
};
