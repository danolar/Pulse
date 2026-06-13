"use client";

import { useCallback, useState } from "react";
import { useAccount } from "wagmi";
import { RefreshCw } from "lucide-react";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import { usePulseStore } from "~~/services/store/pulseStore";

type ActivityEvaluation = {
  shouldReportInactive: boolean;
  reason: string;
  inactiveSeconds: number;
  weight: number;
};

type ActivityResponse = {
  evaluation: ActivityEvaluation;
  pulseOracleAddress: string | null;
  creWorkflow: string;
  error?: string;
};

const DEMO_PROFILE_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

export const ChainlinkActivityPanel = () => {
  const { address } = useAccount();
  const { config } = usePulseStore();
  const watchAddress = address ?? DEMO_PROFILE_ADDRESS;
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ActivityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const evaluate = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        address: watchAddress,
        thresholdSeconds: String(Math.min(config.responseWindow * 60, 3600)),
        weight: String(config.missedAttemptWeight),
      });
      const response = await fetch(`/api/chainlink/activity?${params.toString()}`);
      const body = (await response.json()) as ActivityResponse & { error?: string };

      if (!response.ok) {
        throw new Error(body.error ?? `HTTP ${response.status}`);
      }

      setResult(body);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to evaluate activity");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [watchAddress, config.missedAttemptWeight, config.responseWindow]);

  return (
    <section className="pulse-card p-5 sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="pulse-section-title">Passive · ONCHAIN_TX (CRE)</h2>
          <p className="text-sm text-pulse-muted">
            Chainlink CRE keeper workflow evaluates wallet activity and reports via authorized adapter. Silent by
            default — no owner action required.
          </p>
        </div>
        <PulseButton variant="secondary" className="shrink-0" disabled={loading} onClick={evaluate}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Simulate adapter
        </PulseButton>
      </div>

      {error ? <p className="text-sm text-error">{error}</p> : null}

      {result?.evaluation ? (
        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-base-200/70 p-3">
            <dt className="text-xs uppercase tracking-wide text-pulse-muted">Adapter decision</dt>
            <dd className="mt-1 text-sm text-base-content">
              {result.evaluation.shouldReportInactive
                ? `Report +${result.evaluation.weight} unresponsiveness weight`
                : "No signal — activity within threshold"}
            </dd>
          </div>
          <div className="rounded-2xl bg-base-200/70 p-3">
            <dt className="text-xs uppercase tracking-wide text-pulse-muted">Reason</dt>
            <dd className="mt-1 text-sm text-base-content">{result.evaluation.reason}</dd>
          </div>
          <div className="rounded-2xl bg-base-200/70 p-3">
            <dt className="text-xs uppercase tracking-wide text-pulse-muted">CRE workflow</dt>
            <dd className="mt-1 font-mono text-xs text-base-content">{result.creWorkflow}</dd>
          </div>
          <div className="rounded-2xl bg-base-200/70 p-3">
            <dt className="text-xs uppercase tracking-wide text-pulse-muted">PulseOracle</dt>
            <dd className="mt-1 font-mono text-xs break-all text-base-content">
              {result.pulseOracleAddress ?? "Set NEXT_PUBLIC_PULSE_ORACLE_ADDRESS"}
            </dd>
          </div>
          <div className="rounded-2xl bg-base-200/70 p-3 sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-pulse-muted">Watch address</dt>
            <dd className="mt-1 font-mono text-xs break-all text-base-content">{watchAddress}</dd>
          </div>
        </dl>
      ) : null}
    </section>
  );
};
