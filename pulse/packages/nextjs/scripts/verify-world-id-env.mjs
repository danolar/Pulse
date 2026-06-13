#!/usr/bin/env node
/**
 * Validates World ID env vars for real IDKit (Phase 2 checklist).
 * Usage: node scripts/verify-world-id-env.mjs
 */
const required = [
  { key: "NEXT_PUBLIC_WORLD_APP_ID", prefix: "app_" },
  { key: "NEXT_PUBLIC_WORLD_RP_ID", prefix: "rp_" },
  { key: "WORLD_RP_SIGNING_KEY", prefix: "0x", optionalPrefix: true },
];

let ok = true;

for (const { key, prefix, optionalPrefix } of required) {
  const value = process.env[key]?.trim();
  if (!value) {
    console.error(`Missing ${key}. Copy .env.local.example → .env.local and register at https://developer.world.org`);
    ok = false;
    continue;
  }
  if (!optionalPrefix && !value.startsWith(prefix)) {
    console.error(`${key} must start with "${prefix}" (got "${value.slice(0, 12)}...")`);
    ok = false;
    continue;
  }
  if (optionalPrefix && !value.startsWith("0x") && value.length < 32) {
    console.error(`${key} looks too short — paste the full RP signing key from the Developer Portal.`);
    ok = false;
    continue;
  }
  console.log(`OK ${key}=${value.slice(0, 16)}...`);
}

console.log(
  "Register dynamic actions in the Developer Portal (or allow on-the-fly actions): create-{profileKey}, bind-{profileKey}",
);

process.exit(ok ? 0 : 1);
