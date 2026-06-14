#!/usr/bin/env node
/**
 * Local Chainlink CRE stand-in: evaluates onchain inactivity and optionally calls PulseOracle.reportSignal.
 *
 * Usage:
 *   node scripts/simulate-onchain-activity.mjs
 *   node scripts/simulate-onchain-activity.mjs --broadcast
 */
import { createPublicClient, createWalletClient, http, keccak256, encodePacked, pad, stringToHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hardhat } from "viem/chains";

const pulseOracleAbi = [
  {
    type: "function",
    name: "reportSignal",
    stateMutability: "nonpayable",
    inputs: [
      { name: "profileId", type: "bytes32" },
      { name: "direction", type: "uint8" },
      { name: "walrusBlobId", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "adapters",
    stateMutability: "view",
    inputs: [
      { name: "profileId", type: "bytes32" },
      { name: "adapter", type: "address" },
    ],
    outputs: [
      { name: "authorized", type: "bool" },
      { name: "weight", type: "uint32" },
      { name: "capabilities", type: "uint8" },
      { name: "typeLabel", type: "bytes32" },
    ],
  },
];

const SignalDirection = {
  NEGATIVE: 0,
};

const args = process.argv.slice(2);
const shouldBroadcast = args.includes("--broadcast");

const rpcUrl = process.env.HARDHAT_RPC_URL ?? "http://127.0.0.1:8545";
const oracleAddress = process.env.PULSE_ORACLE_ADDRESS;
const adapterKey =
  process.env.CRE_ADAPTER_PRIVATE_KEY ??
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const profileOwner =
  process.env.PULSE_PROFILE_OWNER ?? "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const profileConsumer =
  process.env.PULSE_PROFILE_CONSUMER ?? "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

const inactivityThresholdSeconds = Number(process.env.PULSE_INACTIVITY_SECONDS ?? 300);
const inactiveSignalWeight = Number(process.env.PULSE_INACTIVE_WEIGHT ?? 8);

const publicClient = createPublicClient({ chain: hardhat, transport: http(rpcUrl) });
const account = privateKeyToAccount(adapterKey);
const walletClient = createWalletClient({ chain: hardhat, transport: http(rpcUrl), account });

const computeProfileId = (owner, consumer) => keccak256(encodePacked(["address", "address"], [owner, consumer]));

const evaluateInactivity = (ownerAddress, lastActivityTimestamp, nowSeconds) => {
  const inactiveSeconds =
    lastActivityTimestamp === null ? Number.POSITIVE_INFINITY : Math.max(0, nowSeconds - lastActivityTimestamp);

  const shouldReportInactive = inactiveSeconds >= inactivityThresholdSeconds;

  return {
    ownerAddress,
    lastActivityTimestamp,
    inactiveSeconds: Number.isFinite(inactiveSeconds) ? inactiveSeconds : inactivityThresholdSeconds + 1,
    shouldReportInactive,
    weight: shouldReportInactive ? inactiveSignalWeight : 0,
    reason: shouldReportInactive
      ? `Inactive ${Math.floor(inactiveSeconds)}s >= ${inactivityThresholdSeconds}s`
      : `Active within threshold (${Math.floor(inactiveSeconds)}s)`,
  };
};

const getLastOutgoingActivity = async ownerAddress => {
  const latestBlock = await publicClient.getBlockNumber();
  const searchWindow = 500n;
  const fromBlock = latestBlock > searchWindow ? latestBlock - searchWindow : 0n;

  for (let blockNumber = latestBlock; blockNumber >= fromBlock; blockNumber--) {
    const block = await publicClient.getBlock({ blockNumber, includeTransactions: true });
    for (const tx of block.transactions) {
      if (typeof tx === "string") continue;
      if (tx.from?.toLowerCase() === ownerAddress.toLowerCase()) {
        return Number(block.timestamp);
      }
    }
  }

  return null;
};

const main = async () => {
  if (!oracleAddress) {
    console.error("Missing PULSE_ORACLE_ADDRESS");
    process.exit(1);
  }

  const profileId = computeProfileId(profileOwner, profileConsumer);
  const adapterAuth = await publicClient.readContract({
    address: oracleAddress,
    abi: pulseOracleAbi,
    functionName: "adapters",
    args: [profileId, account.address],
  });

  if (!adapterAuth[0]) {
    console.error(`Adapter not authorized for profile ${profileId}: ${account.address}`);
    process.exit(1);
  }

  const now = Math.floor(Date.now() / 1000);
  const lastActivity = await getLastOutgoingActivity(profileOwner);
  const evaluation = evaluateInactivity(profileOwner, lastActivity, now);

  console.log("Profile owner:", profileOwner);
  console.log("Profile consumer:", profileConsumer);
  console.log("ProfileId:", profileId);
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

  const walrusBlobId = pad(stringToHex(`walrus://pulse/evidence/onchain-inactivity/${Date.now()}`), { size: 32 });

  const hash = await walletClient.writeContract({
    address: oracleAddress,
    abi: pulseOracleAbi,
    functionName: "reportSignal",
    args: [profileId, SignalDirection.NEGATIVE, walrusBlobId],
  });

  console.log("reportSignal tx:", hash);
};

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
