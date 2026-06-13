#!/usr/bin/env node
/**
 * Validates World ID env vars for real IDKit (Phase 2 checklist).
 * Usage: node scripts/verify-world-id-env.mjs
 */
const required = [
  { key: "NEXT_PUBLIC_WORLD_APP_ID", prefix: "app_" },
  { key: "NEXT_PUBLIC_WORLD_RP_ID", prefix: "rp_" },
];

let ok = true;

for (const { key, prefix } of required) {
  const value = process.env[key]?.trim();
  if (!value) {
    console.error(`Missing ${key}. Copy .env.local.example → .env.local and register at https://developer.world.org`);
    ok = false;
    continue;
  }
  if (!value.startsWith(prefix)) {
    console.error(`${key} must start with "${prefix}" (got "${value.slice(0, 12)}...")`);
    ok = false;
    continue;
  }
  console.log(`OK ${key}=${value.slice(0, 16)}...`);
}

process.exit(ok ? 0 : 1);
