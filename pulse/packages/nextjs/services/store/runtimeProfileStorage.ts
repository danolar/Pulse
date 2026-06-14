"use client";

import type { ConsumerPulseSnapshot } from "~~/services/store/pulseStore";

const RUNTIME_STORAGE_PREFIX = "pulse:runtime:";

const runtimeKey = (consumerAddress: string): string =>
  `${RUNTIME_STORAGE_PREFIX}${consumerAddress.toLowerCase()}`;

export const loadRuntimeSnapshotLocal = (consumerAddress: string): ConsumerPulseSnapshot | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(runtimeKey(consumerAddress));
    if (!raw) return null;
    return JSON.parse(raw) as ConsumerPulseSnapshot;
  } catch {
    return null;
  }
};

export const saveRuntimeSnapshotLocal = (
  consumerAddress: string,
  snapshot: Pick<ConsumerPulseSnapshot, "profiles" | "activeProfileId" | "publicSignalsByOwner">,
): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(runtimeKey(consumerAddress), JSON.stringify(snapshot));
};
