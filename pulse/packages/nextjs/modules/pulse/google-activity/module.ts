import type { PulseVerificationModule } from "../types";

export const googleActivityModule: PulseVerificationModule = {
  id: "google-activity",
  name: "Google activity",
  category: "passive",
  status: "implemented",
  summary: "Inactivity signals from Google account activity. Users connect Google in your app.",
  provider: "Google APIs",
  signalDirection: "negative",
  complements: ["world-id", "onchain-activity"],
  verificationType: "BEHAVIORAL",
  adapterLabel: "GOOGLE_ACTIVITY",
  suggestedWeight: 8,
  setupKind: "adapter",
};
