import { createPublicClient, createWalletClient, http, keccak256, encodePacked, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { getAlchemyHttpUrl } from "~~/utils/scaffold-eth/networks";
import { evaluateOnchainInactivity, type ProfileActivityTarget } from "~~/utils/onchainActivity";
import { uploadPulseEvidence } from "~~/utils/walrus";

const DEFAULT_PROFILE_OWNER = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" as const;
const DEFAULT_PROFILE_CONSUMER = "0x4D7a23045f7C76Dc57e2aFd2eb038e2Cf743e284" as const;

export const pulseOracleV2Abi = [
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
  {
    type: "function",
    name: "computeProfileId",
    stateMutability: "pure",
    inputs: [
      { name: "owner", type: "address" },
      { name: "consumer", type: "address" },
    ],
    outputs: [{ name: "", type: "bytes32" }],
  },
] as const;

export const SignalDirection = {
  NEGATIVE: 0,
  POSITIVE: 1,
} as const;

export type ChainlinkAdapterConfig = {
  rpcUrl: string;
  oracleAddress: `0x${string}`;
  profileOwner: `0x${string}`;
  profileConsumer: `0x${string}`;
  adapterPrivateKey?: `0x${string}`;
  inactivityThresholdSeconds: number;
  inactiveSignalWeight: number;
};

export const getChainlinkAdapterConfig = (): ChainlinkAdapterConfig => {
  const rpcUrl =
    process.env.SEPOLIA_RPC_URL ?? getAlchemyHttpUrl(sepolia.id) ?? "https://ethereum-sepolia-rpc.publicnode.com";

  const oracleAddress = process.env.NEXT_PUBLIC_PULSE_ORACLE_ADDRESS ?? process.env.PULSE_ORACLE_ADDRESS;
  if (!oracleAddress) {
    throw new Error("Missing NEXT_PUBLIC_PULSE_ORACLE_ADDRESS");
  }

  return {
    rpcUrl,
    oracleAddress: oracleAddress as `0x${string}`,
    profileOwner: (process.env.PULSE_PROFILE_OWNER ?? DEFAULT_PROFILE_OWNER) as `0x${string}`,
    profileConsumer: (process.env.PULSE_PROFILE_CONSUMER ?? DEFAULT_PROFILE_CONSUMER) as `0x${string}`,
    adapterPrivateKey: normalizeAdapterPrivateKey(process.env.CRE_ADAPTER_PRIVATE_KEY),
    inactivityThresholdSeconds: Number(process.env.PULSE_INACTIVITY_SECONDS ?? 300),
    inactiveSignalWeight: Number(process.env.PULSE_INACTIVE_WEIGHT ?? 10),
  };
};

export const getSepoliaPublicClient = (rpcUrl: string) =>
  createPublicClient({ chain: sepolia, transport: http(rpcUrl) });

export const computeProfileId = (owner: `0x${string}`, consumer: `0x${string}`): Hex =>
  keccak256(encodePacked(["address", "address"], [owner, consumer]));

const normalizeAdapterPrivateKey = (value: string | undefined): `0x${string}` | undefined => {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  const hex = trimmed.startsWith("0x") ? trimmed : `0x${trimmed}`;
  if (!/^0x[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error("CRE_ADAPTER_PRIVATE_KEY must be 32-byte hex (0x + 64 chars)");
  }

  return hex as `0x${string}`;
};

const getLastOutgoingActivityViaEtherscan = async (profileAddress: string): Promise<number | null> => {
  const apiKey = process.env.ETHERSCAN_API_KEY ?? "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW";
  const params = new URLSearchParams({
    module: "account",
    action: "txlist",
    address: profileAddress,
    startblock: "0",
    endblock: "99999999",
    page: "1",
    offset: "1",
    sort: "desc",
    apikey: apiKey,
  });

  const response = await fetch(`https://api-sepolia.etherscan.io/api?${params.toString()}`);
  if (!response.ok) {
    return null;
  }

  const json = (await response.json()) as {
    status?: string;
    result?: Array<{ timeStamp?: string; from?: string }> | string;
  };

  if (json.status !== "1" || !Array.isArray(json.result) || json.result.length === 0) {
    return null;
  }

  const latest = json.result[0];
  if (!latest?.timeStamp || latest.from?.toLowerCase() !== profileAddress.toLowerCase()) {
    return null;
  }

  return Number(latest.timeStamp);
};

export const getLastOutgoingActivity = async (
  profileAddress: string,
  rpcUrl: string,
): Promise<number | null> => {
  try {
    const etherscanTimestamp = await getLastOutgoingActivityViaEtherscan(profileAddress);
    if (etherscanTimestamp !== null) {
      return etherscanTimestamp;
    }
  } catch {
    // Fall back to RPC block scan below.
  }

  const client = getSepoliaPublicClient(rpcUrl);
  const latestBlock = await client.getBlockNumber();
  const searchWindow = 80n;
  const fromBlock = latestBlock > searchWindow ? latestBlock - searchWindow : 0n;

  for (let blockNumber = latestBlock; blockNumber >= fromBlock; blockNumber--) {
    const block = await client.getBlock({ blockNumber, includeTransactions: true });
    for (const tx of block.transactions) {
      if (typeof tx === "string") continue;
      if (tx.from?.toLowerCase() === profileAddress.toLowerCase()) {
        return Number(block.timestamp);
      }
    }
  }

  return null;
};

export const evaluateChainlinkActivity = async (
  watchAddress: string,
  options?: { thresholdSeconds?: number; weight?: number },
) => {
  const config = getChainlinkAdapterConfig();
  const profile: ProfileActivityTarget = {
    address: watchAddress,
    inactivityThresholdSeconds: options?.thresholdSeconds ?? config.inactivityThresholdSeconds,
    inactiveSignalWeight: options?.weight ?? config.inactiveSignalWeight,
  };

  const lastActivity = await getLastOutgoingActivity(watchAddress, config.rpcUrl);
  const evaluation = evaluateOnchainInactivity(profile, lastActivity, Math.floor(Date.now() / 1000));

  return { config, evaluation };
};

export type ReportOnchainResult = {
  status: "reported" | "skipped" | "dry-run";
  evaluation: Awaited<ReturnType<typeof evaluateChainlinkActivity>>["evaluation"];
  profileId: Hex;
  txHash?: Hex;
  walrusBlobId?: string;
  walrusRef?: string;
  chainRef?: Hex;
};

export const reportInactiveSignalOnchain = async (options?: {
  watchAddress?: string;
  thresholdSeconds?: number;
  weight?: number;
  force?: boolean;
  dryRun?: boolean;
}): Promise<ReportOnchainResult> => {
  const config = getChainlinkAdapterConfig();
  const watchAddress = options?.watchAddress ?? config.profileOwner;
  const { evaluation } = await evaluateChainlinkActivity(watchAddress, {
    thresholdSeconds: options?.thresholdSeconds,
    weight: options?.weight,
  });

  const profileId = computeProfileId(config.profileOwner, config.profileConsumer);

  if (!evaluation.shouldReportInactive && !options?.force) {
    return { status: "skipped", evaluation, profileId };
  }

  if (options?.dryRun) {
    return { status: "dry-run", evaluation, profileId };
  }

  if (!config.adapterPrivateKey) {
    throw new Error("Missing CRE_ADAPTER_PRIVATE_KEY for onchain reportSignal");
  }

  const publicClient = getSepoliaPublicClient(config.rpcUrl);
  const account = privateKeyToAccount(config.adapterPrivateKey);

  const adapterAuth = await publicClient.readContract({
    address: config.oracleAddress,
    abi: pulseOracleV2Abi,
    functionName: "adapters",
    args: [profileId, account.address],
  });

  if (!adapterAuth[0]) {
    throw new Error(`Adapter not authorized: ${account.address} for profile ${profileId}`);
  }

  const evidence = await uploadPulseEvidence({
    type: "onchain-inactivity",
    profileId,
  });

  const walletClient = createWalletClient({
    chain: sepolia,
    transport: http(config.rpcUrl),
    account,
  });

  const txHash = await walletClient.writeContract({
    address: config.oracleAddress,
    abi: pulseOracleV2Abi,
    functionName: "reportSignal",
    args: [profileId, SignalDirection.NEGATIVE, evidence.chainRef],
  });

  return {
    status: "reported",
    evaluation,
    profileId,
    txHash,
    walrusBlobId: evidence.blobId,
    walrusRef: evidence.ref,
    chainRef: evidence.chainRef,
  };
};
