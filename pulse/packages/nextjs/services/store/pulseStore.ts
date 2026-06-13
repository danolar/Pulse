import { create } from "zustand";
import { toWalrusBlobRef, WALRUS_DEMO_BLOBS } from "~~/constants/walrusDemoBlobs";
import { DEFAULT_ENABLED_MODULE_IDS, getPulseModule } from "~~/modules/pulse";
import {
  type ActingRole,
  type AuthorizedRequestor,
  type ConsoleSignal,
  DEFAULT_PROFILE_CONFIG,
  type LifecycleState,
  type ProfileConfig,
  type SignalAdapter,
  type VerificationAttempt,
  type VerificationType,
} from "~~/types/pulse";
import type { PulseWorldIdVerification } from "~~/utils/worldIdProof";
import { assertStoredNullifier, isMockWorldIdVerification } from "~~/utils/worldIdProof";

const buildInitialAdapters = (): SignalAdapter[] =>
  DEFAULT_ENABLED_MODULE_IDS.map(id => getPulseModule(id))
    .filter((module): module is NonNullable<ReturnType<typeof getPulseModule>> => Boolean(module))
    .filter(module => module.setupKind === "adapter")
    .map(module => ({
      id: crypto.randomUUID(),
      moduleId: module.id,
      address: "",
      weight: module.suggestedWeight ?? 10,
      label: module.adapterLabel ?? module.name,
    }));

const buildAttempts = (count: number): VerificationAttempt[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `attempt-${index + 1}`,
    status: index === 0 ? "revealed" : "locked",
    verificationType: index === 0 ? "WORLD_ID" : undefined,
    isActive: index === 0,
    expiredUnopened: index === 1 && count > 1,
  }));

const initialSignals: ConsoleSignal[] = [
  {
    id: "sig-1",
    signalType: "ONCHAIN_TX",
    direction: "negative",
    weight: 8,
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    walrusBlobId: toWalrusBlobRef(WALRUS_DEMO_BLOBS.onchainActivity),
  },
  {
    id: "sig-2",
    signalType: "Missed attempt",
    direction: "negative",
    weight: 15,
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    walrusBlobId: toWalrusBlobRef(WALRUS_DEMO_BLOBS.missedCheckin),
  },
];

type PulseState = {
  actingAs: ActingRole;
  profileId: string | null;
  deviceVerified: boolean;
  deviceNullifierHash: string | null;
  orbBound: boolean;
  orbNullifierHash: string | null;
  configSaved: boolean;
  accessListsSaved: boolean;
  setupComplete: boolean;
  config: ProfileConfig;
  adapters: SignalAdapter[];
  requestors: AuthorizedRequestor[];
  enabledModuleIds: string[];
  lifecycle: LifecycleState;
  epoch: number;
  accumulatedWeight: number;
  attempts: VerificationAttempt[];
  signals: ConsoleSignal[];
  setActingAs: (role: ActingRole) => void;
  mockCreateProfile: (profileId: string, verification?: PulseWorldIdVerification) => void;
  mockBindOrb: (verification?: PulseWorldIdVerification) => void;
  mockSaveConfig: (config: ProfileConfig) => void;
  toggleModule: (moduleId: string) => void;
  ensureModuleEnabled: (moduleId: string) => void;
  setModuleAdapter: (moduleId: string, patch: { address?: string; weight?: number }) => void;
  mockAddRequestor: (address: string) => void;
  mockClaimRequestorSlot: (requestorAddress: string, verification?: PulseWorldIdVerification) => void;
  mockCompleteSetup: () => void;
  mockCheckIn: (verification?: PulseWorldIdVerification) => void;
  mockRequestExtension: (verification?: PulseWorldIdVerification) => void;
  mockBlock: (verification?: PulseWorldIdVerification) => void;
  mockResurrect: (verification?: PulseWorldIdVerification) => void;
  mockRequestEvaluation: (verification?: PulseWorldIdVerification) => void;
  mockRespondToAttempt: (attemptId: string, verificationType?: VerificationType) => void;
  mockForceOpenAttempt: () => void;
  appendSignal: (signal: Omit<ConsoleSignal, "id" | "timestamp"> & { timestamp?: string }) => void;
};

export type PersistedPulseProfile = Pick<
  PulseState,
  | "profileId"
  | "deviceVerified"
  | "deviceNullifierHash"
  | "orbBound"
  | "orbNullifierHash"
  | "configSaved"
  | "accessListsSaved"
  | "setupComplete"
  | "config"
  | "adapters"
  | "requestors"
  | "enabledModuleIds"
  | "actingAs"
  | "lifecycle"
  | "epoch"
  | "accumulatedWeight"
  | "attempts"
  | "signals"
>;

export const getInitialPulseState = (): Omit<
  PulseState,
  keyof Pick<PulseState, "setActingAs" | "mockCreateProfile" | "mockBindOrb" | "mockSaveConfig" | "toggleModule" | "ensureModuleEnabled" | "setModuleAdapter" | "mockAddRequestor" | "mockClaimRequestorSlot" | "mockCompleteSetup" | "mockCheckIn" | "mockRequestExtension" | "mockBlock" | "mockResurrect" | "mockRequestEvaluation" | "mockRespondToAttempt" | "mockForceOpenAttempt" | "appendSignal">
> => ({
  actingAs: "owner",
  profileId: null,
  deviceVerified: false,
  deviceNullifierHash: null,
  orbBound: false,
  orbNullifierHash: null,
  configSaved: false,
  accessListsSaved: false,
  setupComplete: false,
  config: DEFAULT_PROFILE_CONFIG,
  adapters: buildInitialAdapters(),
  requestors: [],
  enabledModuleIds: [...DEFAULT_ENABLED_MODULE_IDS],
  lifecycle: "CREATED",
  epoch: 0,
  accumulatedWeight: 0,
  attempts: [],
  signals: initialSignals,
});

export const toPersistedProfile = (state: PulseState): PersistedPulseProfile => ({
  profileId: state.profileId,
  deviceVerified: state.deviceVerified,
  deviceNullifierHash: state.deviceNullifierHash,
  orbBound: state.orbBound,
  orbNullifierHash: state.orbNullifierHash,
  configSaved: state.configSaved,
  accessListsSaved: state.accessListsSaved,
  setupComplete: state.setupComplete,
  config: state.config,
  adapters: state.adapters,
  requestors: state.requestors,
  enabledModuleIds: state.enabledModuleIds,
  actingAs: state.actingAs,
  lifecycle: state.lifecycle,
  epoch: state.epoch,
  accumulatedWeight: state.accumulatedWeight,
  attempts: state.attempts,
  signals: state.signals,
});

export const usePulseStore = create<PulseState>((set, get) => ({
  ...getInitialPulseState(),

  setActingAs: role => set({ actingAs: role }),

  mockCreateProfile: (profileId, verification) => {
    if (verification && !isMockWorldIdVerification(verification) && verification.level !== "device") {
      throw new Error("createProfile requires Device-level World ID verification.");
    }

    set({
      profileId,
      deviceVerified: true,
      deviceNullifierHash:
        verification && !isMockWorldIdVerification(verification) ? verification.nullifier : null,
      lifecycle: "CREATED",
    });
  },

  mockBindOrb: verification => {
    if (verification && !isMockWorldIdVerification(verification) && verification.level !== "orb") {
      throw new Error("bindOrbIdentity requires Orb-level World ID verification.");
    }

    set({
      orbBound: true,
      orbNullifierHash: verification && !isMockWorldIdVerification(verification) ? verification.nullifier : null,
    });
  },

  mockSaveConfig: config => {
    set({
      config,
      configSaved: true,
      attempts: buildAttempts(config.attemptsPerWindow),
    });
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

      return { enabledModuleIds, adapters };
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

      return { enabledModuleIds: [...state.enabledModuleIds, moduleId], adapters };
    });
  },

  setModuleAdapter: (moduleId, patch) => {
    set(state => ({
      adapters: state.adapters.map(adapter =>
        adapter.moduleId === moduleId
          ? {
              ...adapter,
              ...(patch.address !== undefined ? { address: patch.address } : {}),
              ...(patch.weight !== undefined ? { weight: patch.weight } : {}),
            }
          : adapter,
      ),
    }));
  },

  mockAddRequestor: address => {
    set(state => ({
      requestors: [
        ...state.requestors,
        { id: crypto.randomUUID(), address, authorized: true, claimed: false },
      ],
    }));
  },

  mockClaimRequestorSlot: (requestorAddress, verification) => {
    if (verification && !isMockWorldIdVerification(verification) && verification.level !== "device") {
      throw new Error("claimRequestorSlot requires Device-level World ID verification.");
    }

    set(state => ({
      requestors: state.requestors.map(requestor =>
        requestor.address.toLowerCase() === requestorAddress.toLowerCase()
          ? { ...requestor, claimed: true }
          : requestor,
      ),
    }));
  },

  mockCompleteSetup: () => {
    const { config } = get();
    set({
      accessListsSaved: true,
      setupComplete: true,
      lifecycle: "ACTIVE",
      epoch: 1,
      accumulatedWeight: 23,
      attempts: buildAttempts(config.attemptsPerWindow),
    });
  },

  mockCheckIn: verification => {
    assertStoredNullifier(verification ?? { mock: true, level: "device" }, get().deviceNullifierHash, "device");
    set({ accumulatedWeight: 0, lifecycle: "ACTIVE" });
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
    set({ lifecycle: "BLOCKED", accumulatedWeight: 0 });
  },

  mockResurrect: verification => {
    assertStoredNullifier(verification ?? { mock: true, level: "orb" }, get().orbNullifierHash, "orb");
    set({ lifecycle: "ACTIVE", accumulatedWeight: 0, epoch: get().epoch + 1 });
    get().appendSignal({
      signalType: "Resurrection (Orb)",
      direction: "positive",
      weight: 0,
      walrusBlobId: toWalrusBlobRef(WALRUS_DEMO_BLOBS.checkin),
    });
  },

  mockRequestEvaluation: () => {
    set({ lifecycle: "EVALUATING" });
    get().appendSignal({
      signalType: "Evaluation requested",
      direction: "negative",
      weight: 0,
      walrusBlobId: toWalrusBlobRef(WALRUS_DEMO_BLOBS.checkin),
    });
  },

  mockRespondToAttempt: (attemptId, verificationType = "WORLD_ID") => {
    const isLifeProof = verificationType === "WORLD_ID" || verificationType === "ONCHAIN_TX";

    set(state => ({
      attempts: state.attempts.map(attempt =>
        attempt.id === attemptId
          ? { ...attempt, status: "completed" as const, result: "success" as const, isActive: false }
          : attempt,
      ),
      accumulatedWeight: isLifeProof ? 0 : state.accumulatedWeight,
    }));

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

      return {
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
    });
  },

  appendSignal: signal => {
    set(state => ({
      signals: [
        {
          id: crypto.randomUUID(),
          timestamp: signal.timestamp ?? new Date().toISOString(),
          signalType: signal.signalType,
          direction: signal.direction,
          weight: signal.weight,
          walrusBlobId: signal.walrusBlobId,
        },
        ...state.signals,
      ],
    }));
  },
}));
