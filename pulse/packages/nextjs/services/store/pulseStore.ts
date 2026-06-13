import { create } from "zustand";
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
    walrusBlobId: "walrus://pulse/evidence/bundle-0x8f3a",
  },
  {
    id: "sig-2",
    signalType: "Missed check-in",
    direction: "negative",
    weight: 15,
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    walrusBlobId: "walrus://pulse/evidence/bundle-0x91bc",
  },
];

type PulseState = {
  actingAs: ActingRole;
  profileId: string | null;
  deviceVerified: boolean;
  orbBound: boolean;
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
  mockCreateProfile: (profileId: string) => void;
  mockBindOrb: () => void;
  mockSaveConfig: (config: ProfileConfig) => void;
  mockAddAdapter: (adapter: Omit<SignalAdapter, "id">) => void;
  mockAddRequestor: (address: string) => void;
  mockCompleteSetup: () => void;
  mockCheckIn: () => void;
  mockRequestExtension: () => void;
  mockBlock: () => void;
  mockResurrect: () => void;
  mockRequestEvaluation: () => void;
  mockRespondToAttempt: (attemptId: string) => void;
  mockForceOpenAttempt: () => void;
  appendSignal: (signal: Omit<ConsoleSignal, "id" | "timestamp"> & { timestamp?: string }) => void;
};

export const usePulseStore = create<PulseState>((set, get) => ({
  actingAs: "owner",
  profileId: null,
  deviceVerified: false,
  orbBound: false,
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

  mockCreateProfile: profileId => {
    // TODO: wire to PulseOracle.createProfile(profileId, proof)
    set({
      profileId,
      deviceVerified: true,
      lifecycle: "CREATED",
    });
  },

  mockBindOrb: () => {
    // TODO: wire to PulseOracle.bindOrbIdentity(profileId, proof)
    set({ orbBound: true });
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

  mockCheckIn: () => {
    // TODO: wire to PulseOracle.checkin(...)
    const state = get();
    set({
      accumulatedWeight: Math.max(0, state.accumulatedWeight - 20),
      lifecycle: "ACTIVE",
    });
    get().appendSignal({
      signalType: "Owner check-in",
      direction: "positive",
      weight: -20,
      walrusBlobId: "walrus://pulse/evidence/checkin-latest",
    });
  },

  mockRequestExtension: () => {
    // TODO: wire to PulseOracle.requestExtension(...)
    get().appendSignal({
      signalType: "Extension requested",
      direction: "positive",
      weight: 0,
      walrusBlobId: "walrus://pulse/evidence/extension-request",
    });
  },

  mockBlock: () => {
    // TODO: wire to PulseOracle.block(...)
    set({ lifecycle: "BLOCKED", accumulatedWeight: 0 });
  },

  mockResurrect: () => {
    // TODO: wire to PulseOracle.resurrect(...)
    set({ lifecycle: "ACTIVE", accumulatedWeight: 20, epoch: get().epoch + 1 });
  },

  mockRequestEvaluation: () => {
    // TODO: wire to PulseOracle.requestEvaluation(...)
    set({ lifecycle: "EVALUATING" });
    get().appendSignal({
      signalType: "Evaluation requested",
      direction: "negative",
      weight: 5,
      walrusBlobId: "walrus://pulse/evidence/eval-request",
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
      walrusBlobId: "walrus://pulse/evidence/attempt-response",
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
