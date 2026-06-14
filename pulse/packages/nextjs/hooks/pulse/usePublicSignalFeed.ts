import { useMemo } from "react";
import { useAccount } from "wagmi";
import { aggregatePublicSignalsFromProfiles, usePulseStore } from "~~/services/store/pulseStore";
import type { PublicSignalRecord } from "~~/types/pulse";
import { normalizeAddress } from "~~/utils/pulse/explorerAddress";

export type PublicSignalFeed = {
  ownerAddress: string;
  signals: PublicSignalRecord[];
  totalCount: number;
  firstSignalAt: string | null;
  lastSignalAt: string | null;
  contextCounts: { consumerContextHash: string; count: number }[];
  hasActivity: boolean;
};

const buildContextCounts = (signals: PublicSignalRecord[]) => {
  const counts = new Map<string, number>();
  for (const signal of signals) {
    counts.set(signal.consumerContextHash, (counts.get(signal.consumerContextHash) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([consumerContextHash, count]) => ({ consumerContextHash, count }))
    .sort((a, b) => b.count - a.count);
};

/** Public Explorer feed — encrypted blobs only, aggregated across consumer contexts. */
export const usePublicSignalFeed = (ownerAddress: string): PublicSignalFeed => {
  const profiles = usePulseStore(state => state.profiles);
  const publicSignalsByOwner = usePulseStore(state => state.publicSignalsByOwner);

  return useMemo(() => {
    const normalized = normalizeAddress(ownerAddress);
    const profileList = Object.values(profiles);
    const signals = aggregatePublicSignalsFromProfiles(normalized, profileList);
    const indexed = publicSignalsByOwner[normalized] ?? [];
    const merged = [...signals];
    const seen = new Set(signals.map(s => s.id));
    for (const item of indexed) {
      if (!seen.has(item.id)) merged.push(item);
    }

    merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      ownerAddress: normalized,
      signals: merged,
      totalCount: merged.length,
      firstSignalAt: merged.length ? merged[merged.length - 1].timestamp : null,
      lastSignalAt: merged.length ? merged[0].timestamp : null,
      contextCounts: buildContextCounts(merged),
      hasActivity: merged.length > 0,
    };
  }, [ownerAddress, profiles, publicSignalsByOwner]);
};

export const usePublicSignalAccess = (ownerAddress: string, consumerContextHash: string) => {
  const { address } = useAccount();
  const consumerAddress = usePulseStore(state => state.consumerAddress);

  return useMemo(() => {
    if (!address || !consumerAddress) return false;
    const profile = usePulseStore
      .getState()
      .getProfilesByConsumer(consumerAddress)
      .find(p => p.ownerAddress && normalizeAddress(p.ownerAddress) === normalizeAddress(ownerAddress));
    if (!profile) return false;
    return profile.signals.some(s => s.consumerContextHash === consumerContextHash);
  }, [address, consumerAddress, ownerAddress, consumerContextHash]);
};
