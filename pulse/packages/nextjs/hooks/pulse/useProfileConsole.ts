import { useMemo } from "react";
import { useAccount } from "wagmi";
import { usePulseStore } from "~~/services/store/pulseStore";
import type { PulseProfileSummary } from "~~/types/pulse";
import { normalizeAddress } from "~~/utils/pulse/explorerAddress";

export type ProfileConsoleView = {
  exists: boolean;
  profileId: string | null;
  ownerAddress: string | null;
  consumerAddress: string | null;
  deviceVerified: boolean;
  orbBound: boolean;
  configSaved: boolean;
  setupComplete: boolean;
  config: ReturnType<typeof usePulseStore.getState>["config"];
  lifecycle: ReturnType<typeof usePulseStore.getState>["lifecycle"];
  epoch: number;
  accumulatedWeight: number;
  attempts: ReturnType<typeof usePulseStore.getState>["attempts"];
  signals: ReturnType<typeof usePulseStore.getState>["signals"];
  requestors: ReturnType<typeof usePulseStore.getState>["requestors"];
  adapters: ReturnType<typeof usePulseStore.getState>["adapters"];
};

const emptyConsoleView = (): ProfileConsoleView => ({
  exists: false,
  profileId: null,
  ownerAddress: null,
  consumerAddress: null,
  deviceVerified: false,
  orbBound: false,
  configSaved: false,
  setupComplete: false,
  config: usePulseStore.getState().config,
  lifecycle: "CREATED",
  epoch: 0,
  accumulatedWeight: 0,
  attempts: [],
  signals: [],
  requestors: [],
  adapters: [],
});

export const useProfilesByConsumer = (): PulseProfileSummary[] => {
  const { address } = useAccount();
  const profiles = usePulseStore(state => state.profiles);

  return useMemo(() => {
    if (!address) return [];
    const normalized = normalizeAddress(address);
    return Object.values(profiles)
      .filter(
        profile =>
          profile.consumerAddress &&
          normalizeAddress(profile.consumerAddress) === normalized &&
          profile.setupComplete &&
          profile.profileId,
      )
      .map(profile => ({
        profileId: profile.profileId!,
        ownerAddress: profile.ownerAddress!,
        consumerAddress: profile.consumerAddress!,
        setupComplete: profile.setupComplete,
        lifecycle: profile.lifecycle,
        accumulatedWeight: profile.accumulatedWeight,
        config: profile.config,
        lastSignalAt: profile.signals[0]?.timestamp ?? null,
      }))
      .sort((a, b) => (b.lastSignalAt ?? "").localeCompare(a.lastSignalAt ?? ""));
  }, [address, profiles]);
};

export const useProfileConsole = (profileId: string): ProfileConsoleView => {
  const profiles = usePulseStore(state => state.profiles);

  return useMemo(() => {
    const profile = profiles[profileId] ?? profiles[profileId.toLowerCase()];
    if (!profile?.setupComplete) return emptyConsoleView();

    return {
      exists: true,
      profileId: profile.profileId,
      ownerAddress: profile.ownerAddress,
      consumerAddress: profile.consumerAddress,
      deviceVerified: profile.deviceVerified,
      orbBound: profile.orbBound,
      configSaved: profile.configSaved,
      setupComplete: profile.setupComplete,
      config: profile.config,
      lifecycle: profile.lifecycle,
      epoch: profile.epoch,
      accumulatedWeight: profile.accumulatedWeight,
      attempts: profile.attempts,
      signals: profile.signals,
      requestors: profile.requestors,
      adapters: profile.adapters,
    };
  }, [profileId, profiles]);
};

export type ProfileRole = "none" | "owner" | "requestor" | "consumer";

export const useProfileRole = (
  profileId: string,
  requestors: ProfileConsoleView["requestors"],
  ownerAddress: string | null,
): ProfileRole => {
  const { address } = useAccount();

  return useMemo(() => {
    if (!address || !ownerAddress) return "none";

    const normalizedConnected = normalizeAddress(address);
    const normalizedOwner = normalizeAddress(ownerAddress);

    if (normalizedConnected === normalizedOwner) return "owner";

    const requestor = requestors.find(
      item => item.claimed && normalizeAddress(item.address) === normalizedConnected,
    );
    if (requestor) return "requestor";

    const profile = usePulseStore.getState().profiles[profileId];
    if (
      profile?.consumerAddress &&
      normalizeAddress(profile.consumerAddress) === normalizedConnected
    ) {
      return "consumer";
    }

    return "none";
  }, [address, ownerAddress, profileId, requestors]);
};

export const useCanAccessProfileConsole = (profileId: string): boolean => {
  const { address } = useAccount();
  const profiles = usePulseStore(state => state.profiles);

  return useMemo(() => {
    if (!address) return false;
    const profile = profiles[profileId] ?? profiles[profileId.toLowerCase()];
    if (!profile?.consumerAddress || !profile.setupComplete) return false;
    return normalizeAddress(profile.consumerAddress) === normalizeAddress(address);
  }, [address, profileId, profiles]);
};
