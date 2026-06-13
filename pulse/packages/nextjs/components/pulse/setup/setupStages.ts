import type { SignalAdapter } from "~~/types/pulse";
import { isSignalsStageReady } from "~~/components/pulse/setup/signals/signalsValidation";

export type SetupStageId = "identity" | "signals" | "rhythm";

export const SETUP_STAGES: { id: SetupStageId; label: string; detail: string }[] = [
  { id: "identity", label: "Identity", detail: "World ID reference + wallet dev test" },
  { id: "signals", label: "Signals", detail: "Active adapters on this profile" },
  { id: "rhythm", label: "Rhythm", detail: "Monitoring cadence & randomness" },
];

export type SetupStageProgress = {
  identityDone: boolean;
  signalsDone: boolean;
  rhythmDone: boolean;
};

export const getSetupStageProgress = (state: {
  deviceVerified: boolean;
  configSaved: boolean;
  adapters: SignalAdapter[];
}): SetupStageProgress => ({
  identityDone: state.deviceVerified,
  signalsDone: isSignalsStageReady(),
  rhythmDone: state.configSaved,
});

export const isStageUnlocked = (stageId: SetupStageId, progress: SetupStageProgress): boolean => {
  if (stageId === "identity") return true;
  if (stageId === "signals") return progress.identityDone;
  if (stageId === "rhythm") return progress.identityDone && progress.signalsDone;
  return false;
};

export const isStageComplete = (stageId: SetupStageId, progress: SetupStageProgress): boolean => {
  if (stageId === "identity") return progress.identityDone;
  if (stageId === "signals") return progress.signalsDone;
  if (stageId === "rhythm") return progress.rhythmDone;
  return false;
};

export const getDefaultSetupStage = (progress: SetupStageProgress): SetupStageId => {
  if (!progress.identityDone) return "identity";
  if (!progress.signalsDone) return "signals";
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
