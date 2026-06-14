"use client";

import type { RandomnessAgentConfig } from "~~/types/consumer";

type RandomnessAgentBlockProps = {
  value: RandomnessAgentConfig;
  disabled?: boolean;
  onChange: (value: RandomnessAgentConfig) => void;
};

export const RandomnessAgentBlock = ({ value, disabled, onChange }: RandomnessAgentBlockProps) => {
  return (
    <section className="rounded-2xl border border-base-content/10 bg-base-200/40 p-4 space-y-4">
      <div>
        <h3 className="pulse-label mb-1 text-pulse-muted">Randomness</h3>
        <p className="text-xs text-pulse-muted">
          Drives attempt sequence and timing for profiles you create.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled}
          className={`btn btn-sm rounded-xl ${value.source === "blockhash" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => onChange({ ...value, source: "blockhash", vrfCoordinator: undefined, subscriptionId: undefined })}
        >
          Block hash
        </button>
        <button
          type="button"
          disabled={disabled}
          className={`btn btn-sm rounded-xl ${value.source === "chainlink-vrf" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => onChange({ ...value, source: "chainlink-vrf" })}
        >
          Chainlink VRF
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

      <p className="text-xs leading-relaxed text-pulse-muted">
        Each window commits attempt types onchain before reveal. Missed response windows accrue weight.
      </p>
    </section>
  );
};
