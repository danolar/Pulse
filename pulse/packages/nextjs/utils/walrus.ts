const DEFAULT_AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space";
const DEFAULT_PUBLISHER = "https://publisher.walrus-testnet.walrus.space";

/** Walrus blob IDs are base64url strings (may include `_` and `-`). */
const BLOB_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

export const getWalrusAggregatorUrl = () =>
  process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL?.replace(/\/$/, "") ?? DEFAULT_AGGREGATOR;

export const getWalrusPublisherUrl = () =>
  process.env.WALRUS_PUBLISHER_URL?.replace(/\/$/, "") ?? DEFAULT_PUBLISHER;

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
