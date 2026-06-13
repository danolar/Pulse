"use client";

import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

const RANDOMNESS_COPY = {
  sequence:
    "Each monitoring window commits attempt types onchain before they are revealed. Owners respond during the active card; missed windows accrue weight.",
  randomness:
    "Attempt ordering and evaluation timing use verifiable randomness from the configured source. The AI decision agent (authorized in Adapters) may gate formal evaluation requests as part of this protocol.",
};

export const RandomnessBlock = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocal = targetNetwork.id === 31337;
  const source = isLocal ? "Hardhat block hash (local)" : "Chainlink VRF (production)";

  return (
    <section className="rounded-2xl border border-base-content/10 bg-base-200/40 p-4">
      <h3 className="pulse-label mb-3 text-pulse-muted">Randomness & attempt sequence</h3>
      <dl className="space-y-3 text-sm text-pulse-muted">
        <div>
          <dt className="mb-1 font-medium text-base-content">Randomness source</dt>
          <dd>{source}</dd>
        </div>
        <div>
          <dt className="mb-1 font-medium text-base-content">Sequence</dt>
          <dd className="leading-relaxed">{RANDOMNESS_COPY.sequence}</dd>
        </div>
        <div>
          <dt className="mb-1 font-medium text-base-content">Evaluation gate</dt>
          <dd className="leading-relaxed">{RANDOMNESS_COPY.randomness}</dd>
        </div>
      </dl>
    </section>
  );
};
