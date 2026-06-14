import { create } from "zustand";
import { type Address } from "viem";
import { toWalrusBlobRef, WALRUS_DEMO_BLOBS } from "~~/constants/walrusDemoBlobs";
import { DEFAULT_ENABLED_MODULE_IDS, getPulseModule } from "~~/modules/pulse";
import {
  type AuthorizedRequestor,
  type ConfiguredAdapter,
  type ConsoleSignal,
  DEFAULT_PROFILE_CONFIG,
  type LifecycleState,
  type ProfileConfig,
  type PublicSignalRecord,
  type SignalAdapter,
  type VerificationAttempt,
  type VerificationType,
} from "~~/types/pulse";
import {
  CONSUMER_CONFIG_SCHEMA_VERSION,
  DEFAULT_RANDOMNESS_AGENT,
  type ConsumerConfig,
  type RandomnessAgentConfig,
} from "~~/types/consumer";
import { upsertPublicOwnerProfile } from "~~/services/store/publicExplorerIndex";
import { normalizeAddress } from "~~/utils/pulse/explorerAddress";
import { computeConsumerContextHash, resolveProfileIdentity, type ProfileId } from "~~/utils/pulse/profileId";
import type { PulseWorldIdVerification } from "~~/utils/worldIdProof";
import { assertStoredNullifier, isMockWorldIdVerification } from "~~/utils/worldIdProof";

const buildInitialAdapters = (): SignalAdapter[] => [];

const buildAttempts = (count: number): VerificationAttempt[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `attempt-${index + 1}`,
    status: index === 0 ? "revealed" : "locked",
    verificationType: index === 0 ? "WORLD_ID" : undefined,
    isActive: index === 0,
    expiredUnopened: index === 1 && count > 1,
  }));

const buildDemoSignals = (consumerContextHash: string): ConsoleSignal[] => [
  {
    id: "sig-1",
    signalType: "ONCHAIN_TX",
    direction: "negative",
    weight: 8,
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    walrusBlobId: toWalrusBlobRef(WALRUS_DEMO_BLOBS.onchainActivity),
    adapterAddress: "0x0000000000000000000000000000000000000a01",
    consumerContextHash,
  },
  {
    id: "sig-2",
    signalType: "Missed scheduled check",
    direction: "negative",
    weight: 15,
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    walrusBlobId: toWalrusBlobRef(WALRUS_DEMO_BLOBS.missedCheckin),
    adapterAddress: "0x0000000000000000000000000000000000000a01",
    consumerContextHash,
  },
  {
    id: "sig-3",
    signalType: "Passive inactivity (CRE)",
    direction: "negative",
    weight: 0,
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    walrusBlobId: toWalrusBlobRef(WALRUS_DEMO_BLOBS.onchainActivity),
    adapterAddress: "0x0000000000000000000000000000000000000a02",
    consumerContextHash,
  },
];

export type PersistedPulseProfile = {
  profileId: string | null;
  ownerAddress: string | null;
  consumerAddress: string | null;
  deviceVerified: boolean;
  deviceNullifierHash: string | null;
  orbBound: boolean;
  orbNullifierHash: string | null;
  configSaved: boolean;
  accessListsSaved: boolean;
  setupComplete: boolean;
  config: ProfileConfig;
  notificationTarget: string | null;
  adapters: SignalAdapter[];
  requestors: AuthorizedRequestor[];
  enabledModuleIds: string[];
  lifecycle: LifecycleState;
  epoch: number;
  accumulatedWeight: number;
  attempts: VerificationAttempt[];
  signals: ConsoleSignal[];
};

export type ConsumerPulseSnapshot = {
  configuredAdapters: ConfiguredAdapter[];
  profiles: Record<string, PersistedPulseProfile>;
  activeProfileId: string | null;
  publicSignalsByOwner: Record<string, PublicSignalRecord[]>;
};

type PulseState = PersistedPulseProfile & {
  configuredAdapters: ConfiguredAdapter[];
  profiles: Record<string, PersistedPulseProfile>;
  activeProfileId: string | null;
  publicSignalsByOwner: Record<string, PublicSignalRecord[]>;
  randomnessAgent: RandomnessAgentConfig;
  identityIntegrated: boolean;
  exportConsumerConfig: () => ConsumerConfig;
  importConsumerConfig: (config: ConsumerConfig) => void;
  mockAcknowledgeIdentity: () => void;
  mockSaveRhythmConfig: (
    config: ProfileConfig,
    notificationTarget: string | null,
    randomnessAgent: RandomnessAgentConfig,
  ) => void;
  initProfileTarget: (ownerAddress: string, consumerAddress: string) => ProfileId;
  loadProfile: (profileId: string) => boolean;
  getProfilesByConsumer: (consumerAddress: string) => PersistedPulseProfile[];
  exportConsumerSnapshot: () => ConsumerPulseSnapshot;
  importConsumerSnapshot: (snapshot: ConsumerPulseSnapshot) => void;
  mockCreateProfile: (ownerAddress: string, consumerAddress: string, verification?: PulseWorldIdVerification) => void;
  mockBindOrb: (verification?: PulseWorldIdVerification) => void;
  mockSaveConfig: (config: ProfileConfig, notificationTarget?: string | null) => void;
  toggleModule: (moduleId: string) => void;
  ensureModuleEnabled: (moduleId: string) => void;
  setModuleAdapter: (moduleId: string, patch: { address?: string; weight?: number }) => void;
  mockConfigureAdapter: (adapter: Omit<ConfiguredAdapter, "bindingStatus"> & { bindingStatus?: ConfiguredAdapter["bindingStatus"] }) => void;
  mockRevokeConfiguredAdapter: (catalogId: string) => void;
  mockAuthorizeProfileAdapter: (catalogId: string, weight?: number) => void;
  mockRevokeProfileAdapter: (adapterId: string) => void;
  mockAddRequestor: (address: string) => void;
  mockRemoveRequestor: (requestorId: string) => void;
  mockClaimRequestorSlot: (requestorAddress: string, verification?: PulseWorldIdVerification) => void;
  mockCompleteSetup: () => void;
  mockSeedLabProfile: (ownerAddress: string, consumerAddress: string) => void;
  mockCheckIn: (verification?: PulseWorldIdVerification) => void;
  mockRequestExtension: (verification?: PulseWorldIdVerification) => void;
  mockBlock: (verification?: PulseWorldIdVerification) => void;
  mockResurrect: (verification?: PulseWorldIdVerification) => void;
  mockRequestEvaluation: (verification?: PulseWorldIdVerification) => void;
  mockRespondToAttempt: (attemptId: string, verificationType?: VerificationType) => void;
  mockForceOpenAttempt: () => void;
  mockResolveExpiredAttempt: () => void;
  appendSignal: (signal: Omit<ConsoleSignal, "id" | "timestamp"> & { timestamp?: string }) => void;
};

const toPublicSignal = (signal: ConsoleSignal, status: PublicSignalRecord["status"] = "encrypted"): PublicSignalRecord => ({
  id: signal.id,
  blobId: signal.walrusBlobId,
  timestamp: signal.timestamp,
  adapterAddress: signal.adapterAddress ?? "0x0000000000000000000000000000000000000000",
  consumerContextHash: signal.consumerContextHash ?? "0x00000000",
  status,
});

const syncActiveToProfiles = (state: PulseState): Partial<PulseState> => {
  if (!state.profileId) return {};
  const persisted = toPersistedProfile(state);
  if (persisted.setupComplete) {
    upsertPublicOwnerProfile(persisted);
  }
  return {
    profiles: {
      ...state.profiles,
      [state.profileId]: persisted,
    },
  };
};

export const getInitialPulseState = (): Omit<
  PulseState,
  | "initProfileTarget"
  | "loadProfile"
  | "getProfilesByConsumer"
  | "exportConsumerSnapshot"
  | "importConsumerSnapshot"
  | "mockCreateProfile"
  | "mockBindOrb"
  | "mockSaveConfig"
  | "toggleModule"
  | "ensureModuleEnabled"
  | "setModuleAdapter"
  | "mockConfigureAdapter"
  | "mockRevokeConfiguredAdapter"
  | "mockAuthorizeProfileAdapter"
  | "mockRevokeProfileAdapter"
  | "mockAddRequestor"
  | "mockRemoveRequestor"
  | "mockClaimRequestorSlot"
  | "mockCompleteSetup"
  | "mockSeedLabProfile"
  | "mockCheckIn"
  | "mockRequestExtension"
  | "mockBlock"
  | "mockResurrect"
  | "mockRequestEvaluation"
  | "mockRespondToAttempt"
  | "mockForceOpenAttempt"
  | "mockResolveExpiredAttempt"
  | "appendSignal"
  | "exportConsumerConfig"
  | "importConsumerConfig"
  | "mockAcknowledgeIdentity"
  | "mockSaveRhythmConfig"
> => ({
  profileId: null,
  ownerAddress: null,
  consumerAddress: null,
  deviceVerified: false,
  deviceNullifierHash: null,
  orbBound: false,
  orbNullifierHash: null,
  configSaved: false,
  accessListsSaved: false,
  setupComplete: false,
  config: DEFAULT_PROFILE_CONFIG,
  notificationTarget: null,
  adapters: buildInitialAdapters(),
  configuredAdapters: [],
  requestors: [],
  enabledModuleIds: [...DEFAULT_ENABLED_MODULE_IDS],
  lifecycle: "CREATED",
  epoch: 0,
  accumulatedWeight: 0,
  attempts: [],
  signals: [],
  profiles: {},
  activeProfileId: null,
  publicSignalsByOwner: {},
  randomnessAgent: { ...DEFAULT_RANDOMNESS_AGENT },
  identityIntegrated: false,
});

export const toPersistedProfile = (state: PulseState): PersistedPulseProfile => ({
  profileId: state.profileId,
  ownerAddress: state.ownerAddress,
  consumerAddress: state.consumerAddress,
  deviceVerified: state.deviceVerified,
  deviceNullifierHash: state.deviceNullifierHash,
  orbBound: state.orbBound,
  orbNullifierHash: state.orbNullifierHash,
  configSaved: state.configSaved,
  accessListsSaved: state.accessListsSaved,
  setupComplete: state.setupComplete,
  config: state.config,
  notificationTarget: state.notificationTarget,
  adapters: state.adapters,
  requestors: state.requestors,
  enabledModuleIds: state.enabledModuleIds,
  lifecycle: state.lifecycle,
  epoch: state.epoch,
  accumulatedWeight: state.accumulatedWeight,
  attempts: state.attempts,
  signals: state.signals,
});

const applyPersistedProfile = (profile: PersistedPulseProfile): Partial<PulseState> => ({
  ...profile,
  activeProfileId: profile.profileId,
});

export const usePulseStore = create<PulseState>((set, get) => ({
  ...getInitialPulseState(),

  initProfileTarget: (ownerAddress, consumerAddress) => {
    const { profileId, ownerAddress: owner, consumerAddress: consumer } = resolveProfileIdentity(
      ownerAddress,
      consumerAddress,
    );
    const existing = get().profiles[profileId];

    if (existing) {
      set({ ...applyPersistedProfile(existing), configuredAdapters: get().configuredAdapters });
      return profileId;
    }

    set({
      ...getInitialPulseState(),
      profileId,
      ownerAddress: owner,
      consumerAddress: consumer,
      activeProfileId: profileId,
      configuredAdapters: get().configuredAdapters,
      profiles: get().profiles,
      publicSignalsByOwner: get().publicSignalsByOwner,
    });

    return profileId;
  },

  loadProfile: profileId => {
    const profile = get().profiles[profileId] ?? get().profiles[profileId.toLowerCase()];
    if (!profile) return false;
    set({ ...applyPersistedProfile(profile), configuredAdapters: get().configuredAdapters });
    return true;
  },

  getProfilesByConsumer: consumerAddress => {
    const normalized = normalizeAddress(consumerAddress);
    return Object.values(get().profiles).filter(
      profile =>
        profile.consumerAddress &&
        normalizeAddress(profile.consumerAddress) === normalized &&
        profile.setupComplete,
    );
  },

  exportConsumerSnapshot: () => ({
    configuredAdapters: get().configuredAdapters,
    profiles: get().profiles,
    activeProfileId: get().activeProfileId,
    publicSignalsByOwner: get().publicSignalsByOwner,
  }),

  importConsumerSnapshot: snapshot => {
    const active = snapshot.activeProfileId ? snapshot.profiles[snapshot.activeProfileId] : null;
    for (const profile of Object.values(snapshot.profiles)) {
      if (profile.setupComplete) upsertPublicOwnerProfile(profile);
    }
    set({
      configuredAdapters: snapshot.configuredAdapters,
      profiles: snapshot.profiles,
      activeProfileId: snapshot.activeProfileId,
      publicSignalsByOwner: snapshot.publicSignalsByOwner,
      ...(active ? applyPersistedProfile(active) : getInitialPulseState()),
    });
  },

  exportConsumerConfig: () => {
    const state = get();
    return {
      schemaVersion: CONSUMER_CONFIG_SCHEMA_VERSION,
      consumerAddress: state.consumerAddress ?? "",
      setupComplete: state.setupComplete,
      configuredAdapters: state.configuredAdapters,
      rhythmConfig: state.config,
      notificationTarget: state.notificationTarget,
      randomnessAgent: state.randomnessAgent,
      identityIntegrated: state.identityIntegrated,
    };
  },

  importConsumerConfig: config => {
    set({
      consumerAddress: config.consumerAddress,
      setupComplete: config.setupComplete,
      configuredAdapters: config.configuredAdapters,
      config: config.rhythmConfig,
      notificationTarget: config.notificationTarget,
      randomnessAgent: config.randomnessAgent,
      identityIntegrated: config.identityIntegrated,
      configSaved: Boolean(config.rhythmConfig),
    });
  },

  mockAcknowledgeIdentity: () => {
    set({ identityIntegrated: true });
  },

  mockSaveRhythmConfig: (config, notificationTarget, randomnessAgent) => {
    set({
      config,
      notificationTarget,
      randomnessAgent,
      configSaved: true,
    });
  },

  mockCreateProfile: (ownerAddress, consumerAddress, verification) => {
    if (verification && !isMockWorldIdVerification(verification) && verification.level !== "device") {
      throw new Error("createProfile requires Device-level World ID verification.");
    }

    const { profileId, ownerAddress: owner, consumerAddress: consumer } = resolveProfileIdentity(
      ownerAddress,
      consumerAddress,
    );

    set(state => {
      const next: Partial<PulseState> = {
        profileId,
        ownerAddress: owner,
        consumerAddress: consumer,
        activeProfileId: profileId,
        deviceVerified: true,
        deviceNullifierHash:
          verification && !isMockWorldIdVerification(verification) ? verification.nullifier : null,
        lifecycle: "CREATED",
      };
      return { ...next, ...syncActiveToProfiles({ ...state, ...next } as PulseState) };
    });
  },

  mockBindOrb: verification => {
    if (verification && !isMockWorldIdVerification(verification) && verification.level !== "orb") {
      throw new Error("bindOrbIdentity requires Orb-level World ID verification.");
    }

    set(state => {
      const next: Partial<PulseState> = {
        orbBound: true,
        orbNullifierHash: verification && !isMockWorldIdVerification(verification) ? verification.nullifier : null,
      };
      return { ...next, ...syncActiveToProfiles({ ...state, ...next } as PulseState) };
    });
  },

  mockSaveConfig: (config, notificationTarget = null) => {
    get().mockSaveRhythmConfig(config, notificationTarget, get().randomnessAgent);
  },

  toggleModule: moduleId => {
    const pulseModule = getPulseModule(moduleId);
    if (!pulseModule || pulseModule.required) return;

    set(state => {
      const isEnabled = state.enabledModuleIds.includes(moduleId);
      const enabledModuleIds = isEnabled
        ? state.enabledModuleIds.filter(id => id !== moduleId)
        : [...state.enabledModuleIds, moduleId];

      let adapters = state.adapters;

      if (isEnabled) {
        adapters = adapters.filter(adapter => adapter.moduleId !== moduleId);
      } else if (pulseModule.setupKind === "adapter") {
        const exists = adapters.some(adapter => adapter.moduleId === moduleId);
        if (!exists) {
          adapters = [
            ...adapters,
            {
              id: crypto.randomUUID(),
              moduleId,
              address: "",
              weight: pulseModule.suggestedWeight ?? 10,
              label: pulseModule.adapterLabel ?? pulseModule.name,
            },
          ];
        }
      }

      const next = { enabledModuleIds, adapters };
      return { ...next, ...syncActiveToProfiles({ ...state, ...next } as PulseState) };
    });
  },

  ensureModuleEnabled: moduleId => {
    const pulseModule = getPulseModule(moduleId);
    if (!pulseModule || pulseModule.required) return;

    set(state => {
      if (state.enabledModuleIds.includes(moduleId)) {
        return state;
      }

      let adapters = state.adapters;
      if (pulseModule.setupKind === "adapter" && !adapters.some(adapter => adapter.moduleId === moduleId)) {
        adapters = [
          ...adapters,
          {
            id: crypto.randomUUID(),
            moduleId,
            address: "",
            weight: pulseModule.suggestedWeight ?? 10,
            label: pulseModule.adapterLabel ?? pulseModule.name,
          },
        ];
      }

      const next = { enabledModuleIds: [...state.enabledModuleIds, moduleId], adapters };
      return { ...next, ...syncActiveToProfiles({ ...state, ...next } as PulseState) };
    });
  },

  setModuleAdapter: (moduleId, patch) => {
    set(state => {
      const next = {
        adapters: state.adapters.map(adapter =>
          adapter.moduleId === moduleId
            ? {
                ...adapter,
                ...(patch.address !== undefined ? { address: patch.address } : {}),
                ...(patch.weight !== undefined ? { weight: patch.weight } : {}),
              }
            : adapter,
        ),
      };
      return { ...next, ...syncActiveToProfiles({ ...state, ...next } as PulseState) };
    });
  },

  mockConfigureAdapter: adapter => {
    set(state => {
      const bindingStatus = adapter.bindingStatus ?? "active";
      const existing = state.configuredAdapters.filter(a => a.catalogId !== adapter.catalogId);
      return { configuredAdapters: [...existing, { ...adapter, bindingStatus }] };
    });
    get().ensureModuleEnabled(adapter.catalogId);
  },

  mockRevokeConfiguredAdapter: catalogId => {
    set(state => {
      const next = {
        configuredAdapters: state.configuredAdapters.filter(a => a.catalogId !== catalogId),
        adapters: state.adapters.filter(a => a.moduleId !== catalogId),
      };
      return { ...next, ...syncActiveToProfiles({ ...state, ...next } as PulseState) };
    });
  },

  mockAuthorizeProfileAdapter: (catalogId, weight) => {
    set(state => {
      const configured = state.configuredAdapters.find(a => a.catalogId === catalogId);
      if (!configured) return state;

      const w = weight ?? configured.weight;
      const existing = state.adapters.find(a => a.moduleId === catalogId);
      let adapters: SignalAdapter[];

      if (existing) {
        adapters = state.adapters.map(a =>
          a.moduleId === catalogId ? { ...a, address: configured.adapterAddress, weight: w } : a,
        );
      } else {
        adapters = [
          ...state.adapters,
          {
            id: crypto.randomUUID(),
            moduleId: catalogId,
            address: configured.adapterAddress,
            weight: w,
            label: configured.name,
            typeLabel: configured.typeLabel,
            capabilities: configured.capabilities,
          },
        ];
      }

      const next = { adapters };
      return { ...next, ...syncActiveToProfiles({ ...state, ...next } as PulseState) };
    });
  },

  mockRevokeProfileAdapter: adapterId => {
    set(state => {
      const next = {
        adapters: state.adapters.map(a => (a.id === adapterId ? { ...a, address: "", weight: 0 } : a)),
      };
      return { ...next, ...syncActiveToProfiles({ ...state, ...next } as PulseState) };
    });
  },

  mockAddRequestor: address => {
    set(state => {
      const normalized = normalizeAddress(address);
      if (state.requestors.some(r => normalizeAddress(r.address) === normalized)) return state;
      const next = {
        requestors: [
          ...state.requestors,
          { id: crypto.randomUUID(), address: normalized, authorized: true, claimed: false },
        ],
      };
      return { ...next, ...syncActiveToProfiles({ ...state, ...next } as PulseState) };
    });
  },

  mockRemoveRequestor: requestorId => {
    set(state => {
      const next = { requestors: state.requestors.filter(r => r.id !== requestorId) };
      return { ...next, ...syncActiveToProfiles({ ...state, ...next } as PulseState) };
    });
  },

  mockClaimRequestorSlot: (requestorAddress, verification) => {
    if (verification && !isMockWorldIdVerification(verification) && verification.level !== "device") {
      throw new Error("claimRequestorSlot requires Device-level World ID verification.");
    }

    set(state => {
      const next = {
        requestors: state.requestors.map(requestor =>
          requestor.address.toLowerCase() === requestorAddress.toLowerCase()
            ? { ...requestor, claimed: true }
            : requestor,
        ),
      };
      return { ...next, ...syncActiveToProfiles({ ...state, ...next } as PulseState) };
    });
  },

  mockCompleteSetup: () => {
    set({
      accessListsSaved: true,
      setupComplete: true,
    });
  },

  mockSeedLabProfile: (ownerAddress: string, consumerAddress: string) => {
    const { profileId, ownerAddress: owner, consumerAddress: consumer } = resolveProfileIdentity(
      ownerAddress,
      consumerAddress,
    );
    const consumerHash = computeConsumerContextHash(consumer);
    const { config, configuredAdapters } = get();
    const demoSignals = buildDemoSignals(consumerHash);
    const adapters: SignalAdapter[] = configuredAdapters.map(item => ({
      id: crypto.randomUUID(),
      moduleId: item.catalogId,
      address: item.adapterAddress,
      weight: item.weight,
      label: item.name,
      typeLabel: item.typeLabel,
      capabilities: item.capabilities,
    }));

    const profileState: PersistedPulseProfile = {
      profileId,
      ownerAddress: owner,
      consumerAddress: consumer,
      deviceVerified: true,
      deviceNullifierHash: null,
      orbBound: false,
      orbNullifierHash: null,
      configSaved: true,
      accessListsSaved: true,
      setupComplete: true,
      config,
      notificationTarget: get().notificationTarget,
      adapters,
      requestors: [],
      enabledModuleIds: [],
      lifecycle: "ACTIVE",
      epoch: 1,
      accumulatedWeight: 23,
      attempts: buildAttempts(config.attemptsPerWindow),
      signals: demoSignals,
    };

    set(state => {
      const profiles = { ...state.profiles, [profileId]: profileState };
      const publicSignalsByOwner = { ...state.publicSignalsByOwner };
      publicSignalsByOwner[normalizeAddress(owner)] = demoSignals.map(signal => toPublicSignal(signal));
      upsertPublicOwnerProfile(profileState);
      return {
        profiles,
        publicSignalsByOwner,
        ...applyPersistedProfile(profileState),
        configuredAdapters: state.configuredAdapters,
      };
    });
  },

  mockCheckIn: verification => {
    assertStoredNullifier(verification ?? { mock: true, level: "device" }, get().deviceNullifierHash, "device");
    set(state => {
      const activeAttempt = state.attempts.find(
        attempt => attempt.isActive && attempt.status === "revealed",
      );

      const next: Partial<PulseState> = {
        accumulatedWeight: 0,
        lifecycle: "ACTIVE",
        attempts: activeAttempt
          ? state.attempts.map(attempt =>
              attempt.id === activeAttempt.id
                ? { ...attempt, status: "completed" as const, result: "success" as const, isActive: false }
                : attempt,
            )
          : state.attempts,
      };
      return { ...next, ...syncActiveToProfiles({ ...state, ...next } as PulseState) };
    });
    get().appendSignal({
      signalType: "WORLD_ID check-in",
      direction: "positive",
      weight: 0,
      walrusBlobId: toWalrusBlobRef(WALRUS_DEMO_BLOBS.checkin),
    });
  },

  mockRequestExtension: verification => {
    assertStoredNullifier(verification ?? { mock: true, level: "device" }, get().deviceNullifierHash, "device");
    get().appendSignal({
      signalType: "Extension requested",
      direction: "positive",
      weight: 0,
      walrusBlobId: toWalrusBlobRef(WALRUS_DEMO_BLOBS.checkin),
    });
  },

  mockBlock: verification => {
    assertStoredNullifier(verification ?? { mock: true, level: "orb" }, get().orbNullifierHash, "orb");
    set(state => {
      const next = { lifecycle: "BLOCKED" as LifecycleState, accumulatedWeight: 0 };
      return { ...next, ...syncActiveToProfiles({ ...state, ...next } as PulseState) };
    });
  },

  mockResurrect: verification => {
    assertStoredNullifier(verification ?? { mock: true, level: "orb" }, get().orbNullifierHash, "orb");
    set(state => {
      const next = { lifecycle: "ACTIVE" as LifecycleState, accumulatedWeight: 0, epoch: state.epoch + 1 };
      return { ...next, ...syncActiveToProfiles({ ...state, ...next } as PulseState) };
    });
    get().appendSignal({
      signalType: "Resurrection (Orb)",
      direction: "positive",
      weight: 0,
      walrusBlobId: toWalrusBlobRef(WALRUS_DEMO_BLOBS.checkin),
    });
  },

  mockRequestEvaluation: () => {
    set(state => {
      const next = { lifecycle: "EVALUATING" as LifecycleState };
      return { ...next, ...syncActiveToProfiles({ ...state, ...next } as PulseState) };
    });
    get().appendSignal({
      signalType: "Evaluation requested",
      direction: "negative",
      weight: 0,
      walrusBlobId: toWalrusBlobRef(WALRUS_DEMO_BLOBS.checkin),
    });
  },

  mockRespondToAttempt: (attemptId, verificationType = "WORLD_ID") => {
    const isLifeProof =
      verificationType === "WORLD_ID" || verificationType === "ONCHAIN_TX" || verificationType === "VOICE_AGENT";

    set(state => {
      const next = {
        attempts: state.attempts.map(attempt =>
          attempt.id === attemptId
            ? { ...attempt, status: "completed" as const, result: "success" as const, isActive: false }
            : attempt,
        ),
        accumulatedWeight: isLifeProof ? 0 : state.accumulatedWeight,
      };
      return { ...next, ...syncActiveToProfiles({ ...state, ...next } as PulseState) };
    });

    get().appendSignal({
      signalType: verificationType === "ONCHAIN_TX" ? "ONCHAIN_TX response" : "Attempt response",
      direction: "positive",
      weight: 0,
      walrusBlobId: toWalrusBlobRef(WALRUS_DEMO_BLOBS.checkin),
    });
  },

  mockForceOpenAttempt: () => {
    set(state => {
      const targetIndex = state.attempts.findIndex(a => a.expiredUnopened || a.status === "locked");
      if (targetIndex === -1) return state;

      const next = {
        attempts: state.attempts.map((attempt, index) =>
          index === targetIndex
            ? {
                ...attempt,
                status: "revealed" as const,
                verificationType: "ONCHAIN_TX" as VerificationType,
                isActive: true,
                expiredUnopened: false,
              }
            : { ...attempt, isActive: false },
        ),
      };
      return { ...next, ...syncActiveToProfiles({ ...state, ...next } as PulseState) };
    });
  },

  mockResolveExpiredAttempt: () => {
    set(state => {
      const target = state.attempts.find(a => a.expiredUnopened);
      if (!target) return state;
      const next = {
        attempts: state.attempts.map(attempt =>
          attempt.id === target.id
            ? {
                ...attempt,
                status: "completed" as const,
                result: "failure" as const,
                isActive: false,
                expiredUnopened: false,
              }
            : attempt,
        ),
        accumulatedWeight: state.accumulatedWeight + state.config.missedAttemptWeight,
      };
      return { ...next, ...syncActiveToProfiles({ ...state, ...next } as PulseState) };
    });
  },

  appendSignal: signal => {
    const state = get();
    const consumerHash =
      state.consumerAddress != null
        ? computeConsumerContextHash(state.consumerAddress as Address)
        : signal.consumerContextHash ?? "0x0000000000000000000000000000000000000000000000000000000000000000";

    const decoded: ConsoleSignal = {
      id: crypto.randomUUID(),
      timestamp: signal.timestamp ?? new Date().toISOString(),
      signalType: signal.signalType,
      direction: signal.direction,
      weight: signal.weight,
      walrusBlobId: signal.walrusBlobId,
      adapterAddress: signal.adapterAddress ?? state.adapters.find(a => a.address)?.address,
      consumerContextHash: signal.consumerContextHash ?? consumerHash,
    };

    set(current => {
      const publicRecord = toPublicSignal(decoded);
      const publicSignalsByOwner = { ...current.publicSignalsByOwner };
      if (current.ownerAddress) {
        const ownerKey = normalizeAddress(current.ownerAddress);
        publicSignalsByOwner[ownerKey] = [publicRecord, ...(publicSignalsByOwner[ownerKey] ?? [])];
      }

      const next = { signals: [decoded, ...current.signals], publicSignalsByOwner };
      return { ...next, ...syncActiveToProfiles({ ...current, ...next } as PulseState) };
    });
  },
}));

export const getPublicSignalsForOwner = (ownerAddress: string): PublicSignalRecord[] => {
  const ownerKey = normalizeAddress(ownerAddress);
  return usePulseStore.getState().publicSignalsByOwner[ownerKey] ?? [];
};

export const aggregatePublicSignalsFromProfiles = (
  ownerAddress: string,
  profiles: PersistedPulseProfile[],
): PublicSignalRecord[] => {
  const ownerKey = normalizeAddress(ownerAddress);
  const fromProfiles = profiles
    .filter(p => p.ownerAddress && normalizeAddress(p.ownerAddress) === ownerKey && p.setupComplete)
    .flatMap(p => p.signals.map(signal => toPublicSignal(signal)));

  const fromIndex = getPublicSignalsForOwner(ownerAddress);
  const merged = [...fromIndex, ...fromProfiles];
  const seen = new Set<string>();
  return merged.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};
