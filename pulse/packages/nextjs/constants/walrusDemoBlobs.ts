/**
 * Demo evidence blobs uploaded to Walrus testnet (public publisher, no auth).
 * Re-seed with: yarn test:walrus-roundtrip
 */
export const WALRUS_DEMO_BLOBS = {
  checkin: "X43XkpUSRgtZUHftmcXt8CjZCCm8SZ_58LKeb-IXG70",
  onchainActivity: "jAS_kaoWv1JwYPe0Irs30lhcL1-yj6soPGzpDR2Thm0",
  missedCheckin: "0WNHZ2yN-GfMvWe79IwDYJ6Fte8zR9xw2zJ8fb8hZa0",
} as const;

export const toWalrusBlobRef = (blobId: string) => `walrus://blob/${blobId}`;
