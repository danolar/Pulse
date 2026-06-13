import type { PersistedPulseProfile } from "~~/services/store/pulseStore";

const STORAGE_VERSION = 1;
const STORAGE_PREFIX = "pulse:profile:";

type StoredPulseProfile = {
  version: number;
  updatedAt: string;
  profile: PersistedPulseProfile;
};

const storageKey = (walletAddress: string): string => `${STORAGE_PREFIX}${walletAddress.toLowerCase()}`;

const loadPulseProfileLocal = (walletAddress: string): PersistedPulseProfile | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(storageKey(walletAddress));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredPulseProfile;
    if (parsed.version !== STORAGE_VERSION || !parsed.profile) return null;

    return parsed.profile;
  } catch {
    return null;
  }
};

const savePulseProfileLocal = (walletAddress: string, profile: PersistedPulseProfile): void => {
  if (typeof window === "undefined") return;

  const payload: StoredPulseProfile = {
    version: STORAGE_VERSION,
    updatedAt: new Date().toISOString(),
    profile,
  };

  window.localStorage.setItem(storageKey(walletAddress), JSON.stringify(payload));
};

export const loadPulseProfile = async (walletAddress: string): Promise<PersistedPulseProfile | null> => {
  try {
    const response = await fetch(`/api/profile?owner=${encodeURIComponent(walletAddress)}`);

    if (response.status === 503) {
      return loadPulseProfileLocal(walletAddress);
    }

    if (!response.ok) {
      return loadPulseProfileLocal(walletAddress);
    }

    const data = (await response.json()) as { profile: PersistedPulseProfile | null };

    if (!data.profile) {
      return loadPulseProfileLocal(walletAddress);
    }

    savePulseProfileLocal(walletAddress, data.profile);
    return data.profile;
  } catch {
    return loadPulseProfileLocal(walletAddress);
  }
};

export const savePulseProfile = async (walletAddress: string, profile: PersistedPulseProfile): Promise<void> => {
  savePulseProfileLocal(walletAddress, profile);

  try {
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ owner: walletAddress, profile }),
    });

    if (response.status === 503 || !response.ok) {
      return;
    }
  } catch {
    // Local cache remains as offline fallback.
  }
};
