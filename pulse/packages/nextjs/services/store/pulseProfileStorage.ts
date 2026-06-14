import type { ConsumerPulseSnapshot } from "~~/services/store/pulseStore";

const STORAGE_VERSION = 2;
const STORAGE_PREFIX = "pulse:consumer:";

type StoredConsumerPulse = {
  version: number;
  updatedAt: string;
  snapshot: ConsumerPulseSnapshot;
};

const storageKey = (consumerAddress: string): string => `${STORAGE_PREFIX}${consumerAddress.toLowerCase()}`;

const loadConsumerSnapshotLocal = (consumerAddress: string): ConsumerPulseSnapshot | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(storageKey(consumerAddress));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredConsumerPulse;
    if (parsed.version !== STORAGE_VERSION || !parsed.snapshot) return null;

    return parsed.snapshot;
  } catch {
    return null;
  }
};

const saveConsumerSnapshotLocal = (consumerAddress: string, snapshot: ConsumerPulseSnapshot): void => {
  if (typeof window === "undefined") return;

  const payload: StoredConsumerPulse = {
    version: STORAGE_VERSION,
    updatedAt: new Date().toISOString(),
    snapshot,
  };

  window.localStorage.setItem(storageKey(consumerAddress), JSON.stringify(payload));
};

export const loadConsumerPulseSnapshot = async (consumerAddress: string): Promise<ConsumerPulseSnapshot | null> => {
  try {
    const response = await fetch(`/api/profile?owner=${encodeURIComponent(consumerAddress)}`);

    if (response.status === 503 || !response.ok) {
      return loadConsumerSnapshotLocal(consumerAddress);
    }

    const data = (await response.json()) as { snapshot?: ConsumerPulseSnapshot | null; profile?: unknown };

    if (data.snapshot) {
      saveConsumerSnapshotLocal(consumerAddress, data.snapshot);
      return data.snapshot;
    }

    return loadConsumerSnapshotLocal(consumerAddress);
  } catch {
    return loadConsumerSnapshotLocal(consumerAddress);
  }
};

export const saveConsumerPulseSnapshot = async (
  consumerAddress: string,
  snapshot: ConsumerPulseSnapshot,
): Promise<void> => {
  saveConsumerSnapshotLocal(consumerAddress, snapshot);

  try {
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ owner: consumerAddress, snapshot }),
    });

    if (response.status === 503 || !response.ok) {
      return;
    }
  } catch {
    // Local cache remains as offline fallback.
  }
};
