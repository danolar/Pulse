#!/usr/bin/env node
/**
 * Verifies Walrus write/read + keccak chain ref encoding for PulseOracle.
 * Usage: yarn test:walrus-pipeline
 */
import {
  encodeWalrusRefForChain,
  fetchWalrusBlob,
  formatWalrusEvidence,
  resolveWalrusBlobIdFromChain,
  uploadPulseEvidence,
} from "../utils/walrus";

const DEMO_PROFILE_ID = "0x15bf86d12556e3bf30fea83549f4a6b4168fc54f8bcb9acbbb9fabbf3397fb05";

const main = async () => {
  console.log("Uploading Pulse evidence to Walrus testnet…");

  const uploaded = await uploadPulseEvidence({
    type: "roundtrip-test",
    profileId: DEMO_PROFILE_ID,
  });

  console.log("blobId:", uploaded.blobId);
  console.log("ref:", uploaded.ref);
  console.log("chainRef:", uploaded.chainRef);

  const resolved = resolveWalrusBlobIdFromChain(uploaded.chainRef, [uploaded.blobId]);
  if (resolved !== uploaded.blobId) {
    throw new Error(`resolveWalrusBlobIdFromChain failed: got ${resolved}`);
  }
  console.log("resolveWalrusBlobIdFromChain: OK");

  if (encodeWalrusRefForChain(uploaded.blobId) !== uploaded.chainRef) {
    throw new Error("encodeWalrusRefForChain roundtrip failed");
  }
  console.log("encodeWalrusRefForChain: OK");

  const bytes = await fetchWalrusBlob(uploaded.blobId);
  const { text, isJson } = formatWalrusEvidence(bytes);
  if (!isJson) {
    throw new Error("Expected JSON evidence blob");
  }

  const parsed = JSON.parse(text) as { pulse?: string; type?: string; profileId?: string };
  if (parsed.pulse !== "signal-evidence" || parsed.type !== "roundtrip-test") {
    throw new Error(`Unexpected evidence payload: ${text}`);
  }
  if (parsed.profileId !== DEMO_PROFILE_ID) {
    throw new Error(`Unexpected profileId in blob: ${parsed.profileId}`);
  }

  console.log("Walrus read-back JSON: OK");
  console.log("OK Walrus pipeline passed");
};

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
