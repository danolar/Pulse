#!/usr/bin/env node
/**
 * Local Chainlink CRE stand-in: evaluates onchain inactivity and optionally calls PulseOracle.reportSignal.
 *
 * Usage:
 *   node scripts/simulate-onchain-activity.mjs
 *   node scripts/simulate-onchain-activity.mjs --broadcast
 */
import { createPublicClient, createWalletClient, encodeFunctionData, http, pad, stringToHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hardhat } from "viem/chains";

const pulseOracleAbi = [
  {
    type: "function",
    name: "reportSignal",
    stateMutability: "nonpayable",
    inputs: [
      { name: "profileOwner", type: "address" },
      { name: "signalType", type: "bytes32" },
      { name: "weight", type: "int256" },
      { name: "walrusBlobId", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "authorizedAdapters",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
];

const ONCHAIN_TX = pad(stringToHex("ONCHAIN_TX"), { size: 32 });

const args = process.argv.slice(2);
const shouldBroadcast = args.includes("--broadcast");

const rpcUrl = process.env.HARDHAT_RPC_URL ?? "http://127.0.0.1:8545";
const oracleAddress = process.env.PULSE_ORACLE_ADDRESS;
const adapterKey =
  process.env.CRE_ADAPTER_PRIVATE_KEY ??
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const inactivityThresholdSeconds = Number(process.env.PULSE_INACTIVITY_SECONDS ?? 300);
const inactiveSignalWeight = Number(process.env.PULSE_INACTIVE_WEIGHT ?? 8);

const publicClient = createPublicClient({ chain: hardhat, transport: http(rpcUrl) });
const account = privateKeyToAccount(adapterKey);
const walletClient = createWalletClient({ chain: hardhat, transport: http(rpcUrl), account });

const evaluateInactivity = (profileAddress, lastActivityTimestamp, nowSeconds) => {
  const inactiveSeconds =
    lastActivityTimestamp === null ? Number.POSITIVE_INFINITY : Math.max(0, nowSeconds - lastActivityTimestamp);

  const shouldReportInactive = inactiveSeconds >= inactivityThresholdSeconds;

  return {
    profileAddress,
    lastActivityTimestamp,
    inactiveSeconds: Number.isFinite(inactiveSeconds) ? inactiveSeconds : inactivityThresholdSeconds + 1,
    shouldReportInactive,
    weight: shouldReportInactive ? inactiveSignalWeight : 0,
    reason: shouldReportInactive
      ? `Inactive ${Math.floor(inactiveSeconds)}s >= ${inactivityThresholdSeconds}s`
      : `Active within threshold (${Math.floor(inactiveSeconds)}s)`,
  };
};

const getLastOutgoingActivity = async profileAddress => {
  const latestBlock = await publicClient.getBlockNumber();
  const searchWindow = 500n;
  const fromBlock = latestBlock > searchWindow ? latestBlock - searchWindow : 0n;

  for (let blockNumber = latestBlock; blockNumber >= fromBlock; blockNumber--) {
    const block = await publicClient.getBlock({ blockNumber, includeTransactions: true });
    for (const tx of block.transactions) {
      if (typeof tx === "string") continue;
      if (tx.from?.toLowerCase() === profileAddress.toLowerCase()) {
        return Number(block.timestamp);
      }
    }
  }

  return null;
};

const main = async () => {
  if (!oracleAddress) {
    console.error("Missing PULSE_ORACLE_ADDRESS. Run: yarn deploy:pulse-oracle");
    process.exit(1);
  }

  const profileAddress = process.env.PULSE_PROFILE_ADDRESS ?? account.address;
  const now = Math.floor(Date.now() / 1000);

  const isAdapter = await publicClient.readContract({
    address: oracleAddress,
    abi: pulseOracleAbi,
    functionName: "authorizedAdapters",
    args: [account.address],
  });

  if (!isAdapter) {
    console.error(`Adapter not authorized: ${account.address}`);
    process.exit(1);
  }

  const lastActivity = await getLastOutgoingActivity(profileAddress);
  const evaluation = evaluateInactivity(profileAddress, lastActivity, now);

  console.log("Profile:", profileAddress);
  console.log("Oracle:", oracleAddress);
  console.log("Evaluation:", evaluation);

  if (!evaluation.shouldReportInactive) {
    console.log("OK no inactive signal required");
    process.exit(0);
  }

  if (!shouldBroadcast) {
    console.log("Dry run — pass --broadcast to call PulseOracle.reportSignal");
    process.exit(0);
  }

  const hash = await walletClient.writeContract({
    address: oracleAddress,
    abi: pulseOracleAbi,
    functionName: "reportSignal",
    args: [
      profileAddress,
      ONCHAIN_TX,
      -BigInt(evaluation.weight),
      `walrus://pulse/evidence/onchain-inactivity/${Date.now()}`,
    ],
  });

  console.log("reportSignal tx:", hash);
};

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
