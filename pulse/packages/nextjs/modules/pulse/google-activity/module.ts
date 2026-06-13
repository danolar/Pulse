import type { PulseVerificationModule } from "../types";

export const googleActivityModule: PulseVerificationModule = {
  id: "google-activity",
  name: "Google activity",
  category: "passive",
  status: "implemented",
  summary: "Optional Gmail, Calendar, or Drive signals when you grant OAuth access.",
  provider: "Google APIs",
  signalDirection: "negative",
  complements: ["world-id", "onchain-activity"],
  verificationType: "BEHAVIORAL",
  adapterLabel: "GOOGLE_ACTIVITY",
  suggestedWeight: 8,
  setupKind: "adapter",
};
