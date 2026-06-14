import { useMemo } from "react";
import { mergePublicProfiles } from "~~/services/store/publicExplorerIndex";
import { usePulseStore } from "~~/services/store/pulseStore";
import type { PublicOwnerProfileView } from "~~/types/pulse";
import { normalizeAddress } from "~~/utils/pulse/explorerAddress";

export type ExplorerOwnerView = {
  ownerAddress: string;
  profiles: PublicOwnerProfileView[];
  totalSignalCount: number;
  firstSignalAt: string | null;
  lastSignalAt: string | null;
  hasActivity: boolean;
};

export const useExplorerOwnerView = (ownerAddress: string): ExplorerOwnerView => {
  const profilesMap = usePulseStore(state => state.profiles);

  return useMemo(() => {
    const normalized = normalizeAddress(ownerAddress);
    const liveProfiles = Object.values(profilesMap).filter(
      profile =>
        profile.ownerAddress &&
        normalizeAddress(profile.ownerAddress) === normalized &&
        profile.setupComplete,
    );

    const profiles = mergePublicProfiles(normalized, liveProfiles);
    const allTimestamps = profiles.flatMap(profile => profile.signalTimestamps).sort();
    const totalSignalCount = profiles.reduce((sum, profile) => sum + profile.signalCount, 0);

    return {
      ownerAddress: normalized,
      profiles,
      totalSignalCount,
      firstSignalAt: allTimestamps[0] ?? null,
      lastSignalAt: allTimestamps[allTimestamps.length - 1] ?? null,
      hasActivity: profiles.length > 0,
    };
  }, [ownerAddress, profilesMap]);
};
