import { getAddress, type Hex } from "viem";
import { sepolia } from "viem/chains";
import { WALRUS_DEMO_BLOBS } from "~~/constants/walrusDemoBlobs";
import type { ConsoleSignal, PublicThresholdEvent, PulseOnchainEvent, PulseOnchainEventKind } from "~~/types/pulse";
import { resolveWalrusBlobIdFromChain, toWalrusBlobRef } from "~~/utils/walrus";
import { getBlockExplorerTxLink } from "~~/utils/scaffold-eth/networks";

const ZERO_BYTES32 = `0x${"0".repeat(64)}` as const;

export const KNOWN_WALRUS_BLOB_IDS = Object.values(WALRUS_DEMO_BLOBS);

export const getCreAdapterAddress = (): string | undefined => {
  const fromEnv = process.env.NEXT_PUBLIC_PULSE_CRE_ADAPTER_ADDRESS?.trim();
  if (fromEnv?.startsWith("0x") && fromEnv.length === 42) return getAddress(fromEnv);
  return undefined;
};

export const isZeroWalrusRef = (ref: string): boolean => ref.toLowerCase() === ZERO_BYTES32;

export const resolveWalrusBlobFromChainRef = (
  chainRef: string,
  extraBlobIds: string[] = [],
): string | null => resolveWalrusBlobIdFromChain(chainRef, [...KNOWN_WALRUS_BLOB_IDS, ...extraBlobIds]);

type RawOracleLog = {
  args: Record<string, unknown>;
  transactionHash?: Hex;
  blockNumber?: bigint;
  logIndex?: number;
};

const toIsoTimestamp = (value: unknown): string => {
  if (typeof value === "bigint") return new Date(Number(value) * 1000).toISOString();
  if (typeof value === "number") return new Date(value * 1000).toISOString();
  return new Date().toISOString();
};

const parseRawLog = (
  log: RawOracleLog,
  kind: PulseOnchainEventKind,
  profileId: string,
): PulseOnchainEvent | null => {
  if (!log.transactionHash || log.blockNumber === undefined || log.logIndex === undefined) return null;

  const args = log.args;
  const epoch = Number(args.epoch ?? 0);
  const walrusChainRef = String(args.walrusBlobId ?? args.auditBlobId ?? ZERO_BYTES32) as Hex;
  const walrusBlobId = isZeroWalrusRef(walrusChainRef)
    ? null
    : resolveWalrusBlobFromChainRef(walrusChainRef);

  return {
    id: `${log.transactionHash}-${log.logIndex}`,
    kind,
    profileId,
    timestamp: toIsoTimestamp(args.timestamp),
    epoch,
    reporter: args.reporter ? getAddress(String(args.reporter)) : undefined,
    walrusChainRef,
    walrusBlobId,
    transactionHash: log.transactionHash,
    blockNumber: log.blockNumber,
  };
};

export const parseSignalReportedLogs = (logs: RawOracleLog[] | undefined, profileId: string): PulseOnchainEvent[] =>
  (logs ?? [])
    .map(log => parseRawLog(log, "SignalReported", profileId))
    .filter((event): event is PulseOnchainEvent => event !== null);

export const parseThresholdReachedLogs = (logs: RawOracleLog[] | undefined, profileId: string): PulseOnchainEvent[] =>
  (logs ?? [])
    .map(log => parseRawLog(log, "ThresholdReached", profileId))
    .filter((event): event is PulseOnchainEvent => event !== null);

export const parseWeightResetLogs = (logs: RawOracleLog[] | undefined, profileId: string): PulseOnchainEvent[] =>
  (logs ?? [])
    .map(log => parseRawLog({ ...log, args: { ...log.args, walrusBlobId: ZERO_BYTES32 } }, "WeightReset", profileId))
    .filter((event): event is PulseOnchainEvent => event !== null);

export const mergeOnchainEvents = (...groups: PulseOnchainEvent[][]): PulseOnchainEvent[] => {
  const seen = new Set<string>();
  return groups
    .flat()
    .filter(event => {
      if (seen.has(event.id)) return false;
      seen.add(event.id);
      return true;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const getSepoliaTxUrl = (transactionHash: string): string =>
  getBlockExplorerTxLink(sepolia.id, transactionHash);

export const mapOnchainEventsToConsoleSignals = (
  events: PulseOnchainEvent[],
  options: { ownerAddress?: string | null; inactiveWeight?: number } = {},
): ConsoleSignal[] => {
  const owner = options.ownerAddress ? getAddress(options.ownerAddress) : null;
  const creAdapter = getCreAdapterAddress();
  const inactiveWeight = options.inactiveWeight ?? 10;

  return events
    .filter(event => event.kind === "SignalReported")
    .map(event => {
      const reporter = event.reporter;
      const isCheckin = Boolean(owner && reporter && getAddress(reporter) === owner);
      const isCre =
        Boolean(creAdapter && reporter && getAddress(reporter) === getAddress(creAdapter)) && !isCheckin;

      const signalType = isCheckin
        ? "World ID check-in"
        : isCre
          ? "Passive inactivity (CRE)"
          : "Adapter signal";

      return {
        id: event.id,
        signalType,
        direction: isCheckin ? ("positive" as const) : ("negative" as const),
        weight: isCheckin ? 0 : inactiveWeight,
        timestamp: event.timestamp,
        walrusBlobId: event.walrusBlobId ? toWalrusBlobRef(event.walrusBlobId) : "",
        adapterAddress: reporter,
        onchainVerified: true,
        transactionHash: event.transactionHash,
      };
    });
};

export const mapOnchainThresholdEvents = (events: PulseOnchainEvent[]): PublicThresholdEvent[] =>
  events
    .filter(event => event.kind === "ThresholdReached")
    .map(event => ({
      id: event.id,
      kind: "THRESHOLD_REACHED" as const,
      timestamp: event.timestamp,
      auditBlobId: event.walrusBlobId ? toWalrusBlobRef(event.walrusBlobId) : event.walrusChainRef,
      epoch: event.epoch,
    }));
