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

export const isSignalsStageReady = (): boolean => {
  const { requestors } = usePulseStore.getState();
  return hasActiveProfileAdapter() || requestors.length > 0;
};

export const validateEnabledModulesForActivation = (): boolean => {
  if (isSignalsStageReady()) return true;

  notification.error(
    "Authorize at least one adapter on your profile (via Adapters) or add a trusted requestor.",
  );
  return false;
};
