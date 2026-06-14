import type { PersistedPulseProfile } from "~~/services/store/pulseStore";
import type { LifecycleState, PublicOwnerProfileView, PublicThresholdEvent } from "~~/types/pulse";
import { normalizeAddress } from "~~/utils/pulse/explorerAddress";
import { computeConsumerContextHash } from "~~/utils/pulse/profileId";
import type { Address } from "viem";
import { toWalrusBlobRef, WALRUS_DEMO_BLOBS } from "~~/constants/walrusDemoBlobs";

const STORAGE_KEY = "pulse:public-explorer-index";

const buildThresholdEvents = (profile: PersistedPulseProfile): PublicThresholdEvent[] => {
  if (profile.lifecycle !== "THRESHOLD_REACHED") return [];

  const auditBlobId =
    profile.signals.find(signal => signal.direction === "negative")?.walrusBlobId ??
    toWalrusBlobRef(WALRUS_DEMO_BLOBS.missedCheckin);

  return [
    {
      id: `threshold-${profile.profileId}-${profile.epoch}`,
      kind: "THRESHOLD_REACHED",
      timestamp: profile.signals[0]?.timestamp ?? new Date().toISOString(),
      auditBlobId,
      epoch: profile.epoch,
    },
  ];
};

export const buildPublicOwnerProfileView = (profile: PersistedPulseProfile): PublicOwnerProfileView | null => {
  if (!profile.setupComplete || !profile.profileId || !profile.ownerAddress || !profile.consumerAddress) {
    return null;
  }

  const consumerContextHash = computeConsumerContextHash(profile.consumerAddress as Address);
  const adapterTypes = [
    ...new Set(
      profile.adapters
        .filter(adapter => adapter.address?.trim())
        .map(adapter => adapter.typeLabel ?? adapter.label)
        .filter(Boolean),
    ),
  ];

  const signalTimestamps = profile.signals.map(signal => signal.timestamp).sort();

  return {
    profileId: profile.profileId,
    consumerContextHash,
    lifecycle: profile.lifecycle,
    adapterTypes,
    signalCount: profile.signals.length,
    lastSignalAt: profile.signals[0]?.timestamp ?? null,
    firstSignalAt: signalTimestamps[0] ?? null,
    signalTimestamps,
    thresholdEvents: buildThresholdEvents(profile),
  };
};

export type PublicExplorerIndex = Record<string, PublicOwnerProfileView[]>;

export const loadPublicExplorerIndex = (): PublicExplorerIndex => {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as PublicExplorerIndex;
  } catch {
    return {};
  }
};

export const savePublicExplorerIndex = (index: PublicExplorerIndex): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(index));
};

export const upsertPublicOwnerProfile = (profile: PersistedPulseProfile): PublicExplorerIndex => {
  const view = buildPublicOwnerProfileView(profile);
  const index = loadPublicExplorerIndex();

  if (!view || !profile.ownerAddress) return index;

  const ownerKey = normalizeAddress(profile.ownerAddress);
  const existing = (index[ownerKey] ?? []).filter(item => item.profileId !== view.profileId);
  index[ownerKey] = [view, ...existing].sort((a, b) =>
    (b.lastSignalAt ?? "").localeCompare(a.lastSignalAt ?? ""),
  );

  savePublicExplorerIndex(index);
  return index;
};

export const getPublicProfilesForOwner = (ownerAddress: string): PublicOwnerProfileView[] => {
  const ownerKey = normalizeAddress(ownerAddress);
  return loadPublicExplorerIndex()[ownerKey] ?? [];
};

export const mergePublicProfiles = (
  ownerAddress: string,
  liveProfiles: PersistedPulseProfile[],
): PublicOwnerProfileView[] => {
  const ownerKey = normalizeAddress(ownerAddress);
  const fromIndex = getPublicProfilesForOwner(ownerKey);
  const fromLive = liveProfiles
    .map(buildPublicOwnerProfileView)
    .filter((view): view is PublicOwnerProfileView => view !== null);

  const merged = new Map<string, PublicOwnerProfileView>();
  for (const view of [...fromIndex, ...fromLive]) {
    merged.set(view.profileId, view);
  }

  return Array.from(merged.values()).sort((a, b) =>
    (b.lastSignalAt ?? "").localeCompare(a.lastSignalAt ?? ""),
  );
};
