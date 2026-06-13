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
    "Authorize at least one signal adapter on your profile. Configure credentials in Adapters first.",
  );
  return false;
};
