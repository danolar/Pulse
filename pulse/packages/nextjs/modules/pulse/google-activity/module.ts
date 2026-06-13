import type { PulseVerificationModule } from "../types";

export const googleActivityModule: PulseVerificationModule = {
  id: "google-activity",
  name: "Google activity",
  category: "passive",
  status: "implemented",
  summary: "Inactivity signals from a Google-activity adapter signer — authorize the adapter address here; end users connect Google inside consumer apps.",
  provider: "Google APIs",
  signalDirection: "negative",
  complements: ["world-id", "onchain-activity"],
  verificationType: "BEHAVIORAL",
  adapterLabel: "GOOGLE_ACTIVITY",
  suggestedWeight: 8,
  setupKind: "adapter",
};
