import type { PulseVerificationModule } from "../types";

export const aiAgentModule: PulseVerificationModule = {
  id: "ai-agent",
  name: "AI decision agent",
  category: "decision",
  status: "demo",
  summary: "Reviews requestor actions and flags unusual behavior before weight is applied.",
  provider: "Confidential AI",
  signalDirection: "negative",
  complements: ["world-id"],
  verificationType: "AI_AGENT",
  adapterLabel: "AI_DECISION",
  suggestedWeight: 12,
  setupKind: "adapter",
};
