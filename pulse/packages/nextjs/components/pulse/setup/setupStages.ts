import type { AuthorizedRequestor, SignalAdapter } from "~~/types/pulse";
import { isSignalsStageReady } from "~~/components/pulse/setup/signals/signalsValidation";

export type SetupStageId = "signals" | "identity" | "rhythm";

export const SETUP_STAGES: { id: SetupStageId; label: string; detail: string }[] = [
  { id: "signals", label: "Signals", detail: "Adapters & trusted requestors" },
  { id: "identity", label: "Identity", detail: "World ID Device + Orb" },
  { id: "rhythm", label: "Rhythm", detail: "Monitoring cadence" },
];

export type SetupStageProgress = {
  signalsDone: boolean;
  identityDone: boolean;
  rhythmDone: boolean;
};

export const getSetupStageProgress = (state: {
  deviceVerified: boolean;
  configSaved: boolean;
  adapters: SignalAdapter[];
  requestors: AuthorizedRequestor[];
  enabledModuleIds: string[];
}): SetupStageProgress => {
  const hasAccessLists = state.adapters.length > 0 || state.requestors.length > 0;
  const signalsDone = isSignalsStageReady() && (hasAccessLists || state.enabledModuleIds.length > 0);

  return {
    signalsDone,
    identityDone: state.deviceVerified,
    rhythmDone: state.configSaved,
  };
};

export const isStageUnlocked = (stageId: SetupStageId, progress: SetupStageProgress): boolean => {
  if (stageId === "signals") return true;
  if (stageId === "identity") return progress.signalsDone;
  if (stageId === "rhythm") return progress.identityDone;
  return false;
};

export const isStageComplete = (stageId: SetupStageId, progress: SetupStageProgress): boolean => {
  if (stageId === "signals") return progress.signalsDone;
  if (stageId === "identity") return progress.identityDone;
  if (stageId === "rhythm") return progress.rhythmDone;
  return false;
};

export const getDefaultSetupStage = (progress: SetupStageProgress): SetupStageId => {
  if (!progress.signalsDone) return "signals";
  if (!progress.identityDone) return "identity";
  return "rhythm";
};

export const getNextStage = (stageId: SetupStageId): SetupStageId | null => {
  const index = SETUP_STAGES.findIndex(stage => stage.id === stageId);
  return SETUP_STAGES[index + 1]?.id ?? null;
};

export const getPreviousStage = (stageId: SetupStageId): SetupStageId | null => {
  const index = SETUP_STAGES.findIndex(stage => stage.id === stageId);
  return index > 0 ? SETUP_STAGES[index - 1].id : null;
};
