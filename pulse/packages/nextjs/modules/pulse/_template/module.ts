import type { PulseVerificationModule } from "../types";

/**
 * Copy this folder to `modules/pulse/<your-slug>/`, fill in module.ts,
 * and register in `registry.ts`.
 */
export const templateModule: PulseVerificationModule = {
  id: "your-slug",
  name: "Your module name",
  category: "passive",
  status: "planned",
  summary: "What signal does this module contribute?",
  provider: "Who runs the adapter",
  signalDirection: "negative",
  complements: ["world-id"],
  setupKind: "adapter",
  adapterLabel: "MY_ADAPTER",
  suggestedWeight: 10,
};
