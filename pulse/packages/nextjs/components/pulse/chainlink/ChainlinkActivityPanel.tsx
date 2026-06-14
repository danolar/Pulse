"use client";

import { useCallback, useState } from "react";
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
  profileOwner?: string;
  creWorkflow: string;
  error?: string;
};

/** Seeded hackathon profile owner (Hardhat #1) — monitored by CRE adapter. */
const DEMO_PROFILE_OWNER = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

export const ChainlinkActivityPanel = () => {
  const { config } = usePulseStore();
  const watchAddress = DEMO_PROFILE_OWNER;
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ActivityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const thresholdSeconds = Math.min(config.responseWindow * 60, 3600);
  const weight = config.missedAttemptWeight;

  const evaluate = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        address: watchAddress,
        thresholdSeconds: String(thresholdSeconds),
        weight: String(weight),
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
  }, [watchAddress, thresholdSeconds, weight]);

  const canReport = result?.evaluation?.shouldReportInactive ?? false;

  return (
    <section className="pulse-card p-5 sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="pulse-section-title">Passive · ONCHAIN_TX (CRE)</h2>
          <p className="text-sm text-pulse-muted">
            Chainlink CRE adapter on Sepolia: evaluates wallet inactivity, uploads Walrus evidence, calls{" "}
            <code className="text-xs">reportSignal</code> on PulseOracleV2.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PulseButton variant="secondary" className="shrink-0" disabled={loading} onClick={evaluate}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Simulate adapter
          </PulseButton>
        </div>
      </div>

      <p className="mb-3 text-xs text-pulse-muted">
        Onchain broadcast uses the dedicated hackathon CRE wallet (Hardhat account #3), not your deployer. From repo
        root: <code className="text-[11px]">yarn cre:adapter:generate</code>, fund, authorize, then{" "}
        <code className="text-[11px]">yarn cre:report -- --force</code>.
      </p>

      {error ? <p className="mb-3 text-sm text-error">{error}</p> : null}

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
            <dt className="text-xs uppercase tracking-wide text-pulse-muted">PulseOracleV2</dt>
            <dd className="mt-1 font-mono text-xs break-all text-base-content">
              {result.pulseOracleAddress ?? "Set NEXT_PUBLIC_PULSE_ORACLE_ADDRESS"}
            </dd>
          </div>
          <div className="rounded-2xl bg-base-200/70 p-3 sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-pulse-muted">Monitored owner</dt>
            <dd className="mt-1 font-mono text-xs break-all text-base-content">{watchAddress}</dd>
          </div>
        </dl>
      ) : null}

      {!canReport && result ? (
        <p className="mt-3 text-xs text-pulse-muted">
          Evaluation only in UI. Broadcast via CLI after{" "}
          <code className="text-[11px]">yarn cre:adapter:authorize --network sepolia</code>.
        </p>
      ) : null}
    </section>
  );
};
