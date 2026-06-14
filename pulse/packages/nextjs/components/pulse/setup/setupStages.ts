import { isSignalsStageReady } from "~~/components/pulse/setup/signals/signalsValidation";

export type SetupStageId = "signals" | "identity" | "rhythm";

export const SETUP_STAGES: { id: SetupStageId; label: string; detail: string }[] = [
  { id: "signals", label: "Signals", detail: "Adapters, credentials, and weights" },
  { id: "identity", label: "Identity", detail: "World ID reference for your app" },
  { id: "rhythm", label: "Rhythm", detail: "Cadence, threshold, randomness agent" },
];

export type SetupStageProgress = {
  identityDone: boolean;
  signalsDone: boolean;
  rhythmDone: boolean;
};

export const getSetupStageProgress = (state: {
  identityIntegrated: boolean;
  configSaved: boolean;
}): SetupStageProgress => ({
  identityDone: state.identityIntegrated,
  signalsDone: isSignalsStageReady(),
  rhythmDone: state.configSaved,
});

export const isStageUnlocked = (stageId: SetupStageId, progress: SetupStageProgress): boolean => {
  if (stageId === "signals") return true;
  if (stageId === "identity") return progress.signalsDone;
  if (stageId === "rhythm") return progress.signalsDone && progress.identityDone;
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
