#!/usr/bin/env node
/**
 * Phase 4 — Chainlink CRE CLI smoke test.
 * Usage: node scripts/verify-cre.mjs
 */
import { execFileSync } from "node:child_process";

let ok = true;

const run = (args, { required = true } = {}) => {
  try {
    const output = execFileSync("cre", args, { encoding: "utf8" }).trim();
    console.log(`OK cre ${args.join(" ")}: ${output.split("\n")[0]}`);
    return output;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (required) {
      console.error(`FAIL cre ${args.join(" ")}: ${message.split("\n")[0]}`);
      ok = false;
    } else {
      console.warn(`WARN cre ${args.join(" ")}: not authenticated yet`);
    }
    return null;
  }
};

run(["version"]);
run(["whoami"], { required: false });

if (ok) {
  console.log("");
  console.log("Next: cre login (interactive) then re-run yarn verify:cre");
}

process.exit(ok ? 0 : 1);
