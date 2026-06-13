import { aiAgentModule } from "./ai-agent/module";
import { twilioVoiceModule } from "./twilio-voice/module";
import { googleActivityModule } from "./google-activity/module";
import { onchainActivityModule } from "./onchain-activity/module";
import type { PulseModuleCategory, PulseVerificationModule } from "./types";
import { DEFAULT_ENABLED_MODULE_IDS } from "./types";
import { worldIdModule } from "./world-id/module";

export const PULSE_VERIFICATION_MODULES: PulseVerificationModule[] = [
  worldIdModule,
  onchainActivityModule,
  googleActivityModule,
  twilioVoiceModule,
  aiAgentModule,
];

export const getPulseModule = (id: string): PulseVerificationModule | undefined =>
  PULSE_VERIFICATION_MODULES.find(module => module.id === id);

export const getSelectablePulseModules = (): PulseVerificationModule[] =>
  PULSE_VERIFICATION_MODULES.filter(module => module.selectable !== false);

export const getPulseModulesByCategory = (): Record<PulseModuleCategory, PulseVerificationModule[]> => {
  const grouped: Record<PulseModuleCategory, PulseVerificationModule[]> = {
    identity: [],
    passive: [],
    active: [],
    decision: [],
  };

  for (const module of PULSE_VERIFICATION_MODULES) {
    grouped[module.category].push(module);
  }

  return grouped;
};

export const isModuleConfigurable = (module: PulseVerificationModule): boolean =>
  module.setupKind === "adapter" || module.setupKind === "integration";

export const isModuleReadyForSetup = (module: PulseVerificationModule): boolean =>
  module.status === "implemented" || module.status === "demo";

export { DEFAULT_ENABLED_MODULE_IDS };
