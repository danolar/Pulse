import { usePulseStore } from "~~/services/store/pulseStore";
import { notification } from "~~/utils/scaffold-eth/notification";

export const isSignalsStageReady = (): boolean => {
  const { configuredAdapters } = usePulseStore.getState();
  return configuredAdapters.some(
    adapter => adapter.bindingStatus === "active" && (adapter.isDecisionLayer || adapter.weight > 0),
  );
};

export const validateEnabledModulesForActivation = (): boolean => {
  if (isSignalsStageReady()) return true;

  notification.error("Configure at least one adapter with a weight.");
  return false;
};
