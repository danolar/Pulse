import type { PulseVerificationModule } from "../types";

export const onchainActivityModule: PulseVerificationModule = {
  id: "onchain-activity",
  name: "Onchain activity",
  category: "passive",
  status: "implemented",
  summary: "Detects wallet inactivity and adds weight when you have not transacted recently.",
  provider: "Chainlink CRE",
  signalDirection: "negative",
  complements: ["world-id"],
  verificationType: "ONCHAIN_TX",
  docsUrl: "https://docs.chain.link/cre",
  adapterLabel: "CRE ONCHAIN_TX",
  suggestedWeight: 10,
  setupKind: "adapter",
};
