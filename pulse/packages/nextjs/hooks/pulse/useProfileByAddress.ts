import { useAccount } from "wagmi";
import { usePulseStore } from "~~/services/store/pulseStore";
import { normalizeAddress } from "~~/utils/pulse/explorerAddress";

export type ProfileRole = "none" | "owner" | "requestor";

export type ProfileView = {
  exists: boolean;
  profileId: string | null;
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

/** Mock: reads synced store when profile address matches connected wallet profile. */
export const useProfileByAddress = (profileAddress: string): ProfileView => {
  const normalized = normalizeAddress(profileAddress);
  const store = usePulseStore();
  const { address } = useAccount();

  const isOwnProfile =
    Boolean(address && normalizeAddress(address) === normalized) ||
    Boolean(store.profileId && normalizeAddress(store.profileId) === normalized);

  if (!isOwnProfile || !store.setupComplete) {
    return {
      exists: false,
      profileId: null,
      deviceVerified: false,
      orbBound: false,
      configSaved: false,
      setupComplete: false,
      config: store.config,
      lifecycle: "CREATED",
      epoch: 0,
      accumulatedWeight: 0,
      attempts: [],
      signals: [],
      requestors: [],
      adapters: [],
    };
  }

  return {
    exists: true,
    profileId: store.profileId,
    deviceVerified: store.deviceVerified,
    orbBound: store.orbBound,
    configSaved: store.configSaved,
    setupComplete: store.setupComplete,
    config: store.config,
    lifecycle: store.lifecycle,
    epoch: store.epoch,
    accumulatedWeight: store.accumulatedWeight,
    attempts: store.attempts,
    signals: store.signals,
    requestors: store.requestors,
    adapters: store.adapters,
  };
};

export const useProfileRole = (profileAddress: string, requestors: ProfileView["requestors"]): ProfileRole => {
  const { address } = useAccount();
  if (!address) return "none";

  const normalizedProfile = normalizeAddress(profileAddress);
  const normalizedConnected = normalizeAddress(address);

  if (normalizedConnected === normalizedProfile) return "owner";

  const requestor = requestors.find(
    item => item.claimed && normalizeAddress(item.address) === normalizedConnected,
  );
  if (requestor) return "requestor";

  return "none";
};
