#!/usr/bin/env node
/**
 * Phase 3 — Walrus testnet smoke test (aggregator read + optional demo blob).
 * Usage: node scripts/verify-walrus.mjs
 */
/** Keep in sync with constants/walrusDemoBlobs.ts */
const DEMO_CHECKIN_BLOB = "X43XkpUSRgtZUHftmcXt8CjZCCm8SZ_58LKeb-IXG70";

const aggregator =
  process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL?.replace(/\/$/, "") ??
  "https://aggregator.walrus-testnet.walrus.space";

let ok = true;

try {
  const apiResponse = await fetch(`${aggregator}/v1/api`);
  if (!apiResponse.ok) {
    console.error(`Walrus aggregator /v1/api returned HTTP ${apiResponse.status}`);
    ok = false;
  } else {
    console.log(`OK aggregator reachable at ${aggregator}`);
  }
} catch (error) {
  console.error(`Walrus aggregator unreachable: ${error instanceof Error ? error.message : error}`);
  ok = false;
}

const demoBlobId = DEMO_CHECKIN_BLOB;

try {
  const blobResponse = await fetch(`${aggregator}/v1/blobs/${demoBlobId}`);
  if (!blobResponse.ok) {
    console.error(`Demo blob read failed HTTP ${blobResponse.status} (${demoBlobId})`);
    ok = false;
  } else {
    const text = await blobResponse.text();
    console.log(`OK demo blob ${demoBlobId.slice(0, 12)}… (${text.length} bytes)`);
  }
} catch (error) {
  console.error(`Demo blob read error: ${error instanceof Error ? error.message : error}`);
  ok = false;
}

process.exit(ok ? 0 : 1);
