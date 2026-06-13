#!/usr/bin/env node
/**
 * Uploads a sample evidence JSON to Walrus testnet and verifies read-back.
 * Usage: node scripts/test-walrus-roundtrip.mjs
 */
const publisher =
  process.env.WALRUS_PUBLISHER_URL?.replace(/\/$/, "") ?? "https://publisher.walrus-testnet.walrus.space";
const aggregator =
  process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL?.replace(/\/$/, "") ??
  "https://aggregator.walrus-testnet.walrus.space";

const payload = JSON.stringify({
  pulse: "evidence",
  type: "roundtrip-test",
  createdAt: new Date().toISOString(),
});

console.log(`Uploading to ${publisher}…`);

const uploadResponse = await fetch(`${publisher}/v1/blobs?epochs=1`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: payload,
});

if (!uploadResponse.ok) {
  console.error(`Upload failed HTTP ${uploadResponse.status}`);
  process.exit(1);
}

const uploadJson = await uploadResponse.json();
const blobId = uploadJson?.newlyCreated?.blobObject?.blobId ?? uploadJson?.alreadyCertified?.blobId;

if (!blobId) {
  console.error("Upload response missing blobId:", uploadJson);
  process.exit(1);
}

console.log(`Uploaded blobId: ${blobId}`);
console.log(`Ref for pulseStore: walrus://blob/${blobId}`);

console.log("Reading back from aggregator…");
const readResponse = await fetch(`${aggregator}/v1/blobs/${blobId}`);

if (!readResponse.ok) {
  console.error(`Read failed HTTP ${readResponse.status}`);
  process.exit(1);
}

const readText = await readResponse.text();
if (readText !== payload) {
  console.error("Roundtrip mismatch");
  console.error("expected:", payload);
  console.error("got:", readText);
  process.exit(1);
}

console.log("OK Walrus roundtrip passed");
