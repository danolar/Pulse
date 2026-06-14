import { usePulseStore } from "~~/services/store/pulseStore";
import { notification } from "~~/utils/scaffold-eth/notification";

const hasActiveProfileAdapter = (): boolean => {
  const { adapters } = usePulseStore.getState();
  return adapters.some(
    adapter =>
      adapter.address?.trim() &&
      (adapter.weight > 0 || adapter.moduleId === "ai-agent"),
  );
};

export const isSignalsStageReady = (): boolean => hasActiveProfileAdapter();

export const validateEnabledModulesForActivation = (): boolean => {
  if (isSignalsStageReady()) return true;

  notification.error(
    "Activate at least one configured adapter on this profile (Add in the Signals table).",
  );
  return false;
};
