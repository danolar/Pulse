"use client";

import type { RandomnessAgentConfig } from "~~/types/consumer";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

const RANDOMNESS_COPY = {
  sequence:
    "Each monitoring window commits attempt types onchain before they are revealed. Owners respond during the active card; missed windows accrue weight.",
  evaluation:
    "The AI decision adapter (if configured) may gate formal evaluation requests. Attempt ordering uses the randomness source below.",
};

type RandomnessAgentBlockProps = {
  value: RandomnessAgentConfig;
  disabled?: boolean;
  onChange: (value: RandomnessAgentConfig) => void;
};

export const RandomnessAgentBlock = ({ value, disabled, onChange }: RandomnessAgentBlockProps) => {
  const { targetNetwork } = useTargetNetwork();
  const isLocal = targetNetwork.id === 31337;

  return (
    <section className="rounded-2xl border border-base-content/10 bg-base-200/40 p-4 space-y-4">
      <div>
        <h3 className="pulse-label mb-1 text-pulse-muted">Randomness agent</h3>
        <p className="text-xs text-pulse-muted">
          Configured once per consumer. Drives attempt sequence and timing for all profiles you create.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled}
          className={`btn btn-sm rounded-xl ${value.source === "blockhash" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => onChange({ ...value, source: "blockhash", vrfCoordinator: undefined, subscriptionId: undefined })}
        >
          Block hash {isLocal ? "(local testnet)" : "(testnet fallback)"}
        </button>
        <button
          type="button"
          disabled={disabled}
          className={`btn btn-sm rounded-xl ${value.source === "chainlink-vrf" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => onChange({ ...value, source: "chainlink-vrf" })}
        >
          Chainlink VRF (production)
        </button>
      </div>

      {value.source === "chainlink-vrf" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="form-control">
            <span className="label-text mb-1 text-xs text-pulse-muted">VRF coordinator</span>
            <input
              className="input input-bordered input-sm rounded-xl font-mono text-xs"
              placeholder="0x…"
              disabled={disabled}
              value={value.vrfCoordinator ?? ""}
              onChange={event => onChange({ ...value, vrfCoordinator: event.target.value })}
            />
          </label>
          <label className="form-control">
            <span className="label-text mb-1 text-xs text-pulse-muted">Subscription ID</span>
            <input
              className="input input-bordered input-sm rounded-xl font-mono text-xs"
              placeholder="1234…"
              disabled={disabled}
              value={value.subscriptionId ?? ""}
              onChange={event => onChange({ ...value, subscriptionId: event.target.value })}
            />
          </label>
        </div>
      ) : null}

      <dl className="space-y-2 text-xs text-pulse-muted">
        <div>
          <dt className="mb-0.5 font-medium text-base-content">Sequence</dt>
          <dd className="leading-relaxed">{RANDOMNESS_COPY.sequence}</dd>
        </div>
        <div>
          <dt className="mb-0.5 font-medium text-base-content">Evaluation gate</dt>
          <dd className="leading-relaxed">{RANDOMNESS_COPY.evaluation}</dd>
        </div>
      </dl>
    </section>
  );
};
