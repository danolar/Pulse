#!/usr/bin/env node
/**
 * Chainlink CRE stand-in: evaluate Sepolia inactivity + optional reportSignal with Walrus evidence.
 *
 * Usage:
 *   yarn simulate:onchain-activity
 *   yarn simulate:onchain-activity -- --broadcast
 *   yarn simulate:onchain-activity -- --broadcast --force
 */
import {
  getChainlinkAdapterConfig,
  reportInactiveSignalOnchain,
} from "../utils/chainlinkOnchainAdapter";

const args = process.argv.slice(2);
const shouldBroadcast = args.includes("--broadcast");
const force = args.includes("--force");

const main = async () => {
  const config = getChainlinkAdapterConfig();

  console.log("Network: Sepolia");
  console.log("Oracle:", config.oracleAddress);
  console.log("Profile owner:", config.profileOwner);
  console.log("Profile consumer:", config.profileConsumer);

  const result = await reportInactiveSignalOnchain({
    watchAddress: config.profileOwner,
    force,
    dryRun: !shouldBroadcast,
  });

  console.log("Evaluation:", result.evaluation);

  if (result.status === "skipped") {
    console.log("OK no inactive signal required (use --force --broadcast for demo override)");
    process.exit(0);
  }

  if (result.status === "dry-run") {
    console.log("Dry run — pass --broadcast to upload Walrus evidence and call reportSignal");
    process.exit(0);
  }

  console.log("Walrus blobId:", result.walrusBlobId);
  console.log("Walrus ref:", result.walrusRef);
  console.log("Chain ref:", result.chainRef);
  console.log("reportSignal tx:", result.txHash);
  console.log(`https://sepolia.etherscan.io/tx/${result.txHash}`);
};

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
