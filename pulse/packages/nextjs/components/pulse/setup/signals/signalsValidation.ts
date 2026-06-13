import { getPulseModule, isModuleReadyForSetup } from "~~/modules/pulse";
import { usePulseStore } from "~~/services/store/pulseStore";
import { notification } from "~~/utils/scaffold-eth/notification";

export const isSignalsStageReady = (): boolean => {
  const { enabledModuleIds, adapters } = usePulseStore.getState();

  for (const moduleId of enabledModuleIds) {
    const module = getPulseModule(moduleId);
    if (!module || module.setupKind !== "adapter" || !isModuleReadyForSetup(module)) continue;
    if (moduleId === "ai-agent") continue;
    const adapter = adapters.find(row => row.moduleId === moduleId);
    if (!adapter?.address?.trim()) {
      return false;
    }
  }

  return true;
};

export const validateEnabledModulesForActivation = (): boolean => {
  if (isSignalsStageReady()) return true;

  const { enabledModuleIds, adapters } = usePulseStore.getState();

  for (const moduleId of enabledModuleIds) {
    const module = getPulseModule(moduleId);
    if (!module || module.setupKind !== "adapter" || !isModuleReadyForSetup(module)) continue;
    if (moduleId === "ai-agent") continue;
    const adapter = adapters.find(row => row.moduleId === moduleId);
    if (!adapter?.address?.trim()) {
      notification.error(`Set a signer address for ${module.name} or disable it below.`);
      return false;
    }
  }

  return true;
};
