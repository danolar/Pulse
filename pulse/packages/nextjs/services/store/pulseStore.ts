import { create } from "zustand";
import { toWalrusBlobRef, WALRUS_DEMO_BLOBS } from "~~/constants/walrusDemoBlobs";
import {
  type ActingRole,
  type AuthorizedRequestor,
  type ConsoleSignal,
  DEFAULT_PROFILE_CONFIG,
  type LifecycleState,
  type ProfileConfig,
  type SignalAdapter,
  type VerificationAttempt,
} from "~~/types/pulse";
import type { PulseWorldIdVerification } from "~~/utils/worldIdProof";
import { assertStoredNullifier, isMockWorldIdVerification } from "~~/utils/worldIdProof";

const buildAttempts = (count: number): VerificationAttempt[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `attempt-${index + 1}`,
    status: index === 0 ? "revealed" : "locked",
    verificationType: index === 0 ? "World ID" : undefined,
    isActive: index === 0,
    expiredUnopened: index === 1 && count > 1,
  }));

const initialSignals: ConsoleSignal[] = [
  {
    id: "sig-1",
    signalType: "Onchain activity",
    direction: "positive",
    weight: -8,
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    walrusBlobId: toWalrusBlobRef(WALRUS_DEMO_BLOBS.onchainActivity),
  },
  {
    id: "sig-2",
    signalType: "Missed check-in",
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
  lifecycle: LifecycleState;
  epoch: number;
  accumulatedWeight: number;
  attempts: VerificationAttempt[];
  signals: ConsoleSignal[];
  setActingAs: (role: ActingRole) => void;
  mockCreateProfile: (profileId: string, verification?: PulseWorldIdVerification) => void;
  mockBindOrb: (verification?: PulseWorldIdVerification) => void;
  mockSaveConfig: (config: ProfileConfig) => void;
  mockAddAdapter: (adapter: Omit<SignalAdapter, "id">) => void;
  mockAddRequestor: (address: string) => void;
  mockCompleteSetup: () => void;
  mockCheckIn: (verification?: PulseWorldIdVerification) => void;
  mockRequestExtension: (verification?: PulseWorldIdVerification) => void;
  mockBlock: (verification?: PulseWorldIdVerification) => void;
  mockResurrect: (verification?: PulseWorldIdVerification) => void;
  mockRequestEvaluation: (verification?: PulseWorldIdVerification) => void;
  mockRespondToAttempt: (attemptId: string) => void;
  mockForceOpenAttempt: () => void;
  appendSignal: (signal: Omit<ConsoleSignal, "id" | "timestamp"> & { timestamp?: string }) => void;
};

export const usePulseStore = create<PulseState>((set, get) => ({
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
  adapters: [],
  requestors: [],
  lifecycle: "CREATED",
  epoch: 0,
  accumulatedWeight: 0,
  attempts: [],
  signals: initialSignals,

  setActingAs: role => set({ actingAs: role }),

  mockCreateProfile: (profileId, verification) => {
    // TODO: wire to PulseOracle.createProfile(profileId, proof)
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
    // TODO: wire to PulseOracle.bindOrbIdentity(profileId, proof)
    if (verification && !isMockWorldIdVerification(verification) && verification.level !== "orb") {
      throw new Error("bindOrbIdentity requires Orb-level World ID verification.");
    }

    set({
      orbBound: true,
      orbNullifierHash: verification && !isMockWorldIdVerification(verification) ? verification.nullifier : null,
    });
  },

  mockSaveConfig: config => {
    // TODO: wire to PulseOracle.setConfig(...)
    set({
      config,
      configSaved: true,
      attempts: buildAttempts(config.attemptsPerWindow),
    });
  },

  mockAddAdapter: adapter => {
    // TODO: wire to PulseOracle.authorizeAdapter(address, weight, label)
    set(state => ({
      adapters: [...state.adapters, { ...adapter, id: crypto.randomUUID() }],
    }));
  },

  mockAddRequestor: address => {
    // TODO: wire to PulseOracle.authorizeRequestor(address)
    set(state => ({
      requestors: [...state.requestors, { id: crypto.randomUUID(), address }],
    }));
  },

  mockCompleteSetup: () => {
    const { config } = get();
    set({
      accessListsSaved: true,
      setupComplete: true,
      lifecycle: "ACTIVE",
      epoch: 1,
      accumulatedWeight: 35,
      attempts: buildAttempts(config.attemptsPerWindow),
    });
  },

  mockCheckIn: verification => {
    // TODO: wire to PulseOracle.checkin(...)
    assertStoredNullifier(verification ?? { mock: true, level: "device" }, get().deviceNullifierHash, "device");
    const state = get();
    set({
      accumulatedWeight: Math.max(0, state.accumulatedWeight - 20),
      lifecycle: "ACTIVE",
    });
    get().appendSignal({
      signalType: "Owner check-in",
      direction: "positive",
      weight: -20,
      walrusBlobId: toWalrusBlobRef(WALRUS_DEMO_BLOBS.checkin),
    });
  },

  mockRequestExtension: verification => {
    // TODO: wire to PulseOracle.requestExtension(...)
    assertStoredNullifier(verification ?? { mock: true, level: "device" }, get().deviceNullifierHash, "device");
    get().appendSignal({
      signalType: "Extension requested",
      direction: "positive",
      weight: 0,
      walrusBlobId: toWalrusBlobRef(WALRUS_DEMO_BLOBS.checkin),
    });
  },

  mockBlock: verification => {
    // TODO: wire to PulseOracle.block(...)
    assertStoredNullifier(verification ?? { mock: true, level: "orb" }, get().orbNullifierHash, "orb");
    set({ lifecycle: "BLOCKED", accumulatedWeight: 0 });
  },

  mockResurrect: verification => {
    // TODO: wire to PulseOracle.resurrect(...)
    assertStoredNullifier(verification ?? { mock: true, level: "orb" }, get().orbNullifierHash, "orb");
    set({ lifecycle: "ACTIVE", accumulatedWeight: 20, epoch: get().epoch + 1 });
  },

  mockRequestEvaluation: () => {
    // TODO: wire to PulseOracle.requestEvaluation(...) with requestor nullifier from claimRequestorSlot
    set({ lifecycle: "EVALUATING" });
    get().appendSignal({
      signalType: "Evaluation requested",
      direction: "negative",
      weight: 5,
      walrusBlobId: toWalrusBlobRef(WALRUS_DEMO_BLOBS.checkin),
    });
  },

  mockRespondToAttempt: attemptId => {
    // TODO: wire to PulseOracle.respondToAttempt(...)
    set(state => ({
      attempts: state.attempts.map(attempt =>
        attempt.id === attemptId
          ? { ...attempt, status: "completed" as const, result: "success" as const, isActive: false }
          : attempt,
      ),
      accumulatedWeight: Math.max(0, state.accumulatedWeight - 10),
    }));
    get().appendSignal({
      signalType: "Attempt response",
      direction: "positive",
      weight: -10,
      walrusBlobId: toWalrusBlobRef(WALRUS_DEMO_BLOBS.checkin),
    });
  },

  mockForceOpenAttempt: () => {
    // TODO: wire to PulseOracle.forceOpenAttempt(...)
    set(state => {
      const targetIndex = state.attempts.findIndex(a => a.expiredUnopened || a.status === "locked");
      if (targetIndex === -1) return state;

      return {
        attempts: state.attempts.map((attempt, index) =>
          index === targetIndex
            ? {
                ...attempt,
                status: "revealed" as const,
                verificationType: "World ID",
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
