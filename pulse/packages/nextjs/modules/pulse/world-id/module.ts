import type { PulseVerificationModule } from "../types";

export const worldIdModule: PulseVerificationModule = {
  id: "world-id",
  name: "World ID",
  category: "identity",
  status: "implemented",
  summary: "Prove you are a real person. Required for consent, check-ins, and emergency controls.",
  provider: "World App",
  signalDirection: "both",
  complements: [],
  verificationType: "WORLD_ID",
  docsUrl: "https://docs.world.org/world-id/overview",
  required: true,
  selectable: false,
  setupKind: "none",
};
