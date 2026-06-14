"use client";

import { useCallback, useState } from "react";
import { ExternalLink, RefreshCw, Zap } from "lucide-react";
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

type ReportResponse = {
  status: string;
  txHash?: string;
  walrusBlobId?: string;
  walrusRef?: string;
  chainRef?: string;
  explorerUrl?: string;
  message?: string;
  error?: string;
};

/** Seeded hackathon profile owner (Hardhat #1) — monitored by CRE adapter. */
const DEMO_PROFILE_OWNER = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

export const ChainlinkActivityPanel = () => {
  const { config } = usePulseStore();
  const watchAddress = DEMO_PROFILE_OWNER;
  const [loading, setLoading] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [result, setResult] = useState<ActivityResponse | null>(null);
  const [reportResult, setReportResult] = useState<ReportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const thresholdSeconds = Math.min(config.responseWindow * 60, 3600);
  const weight = config.missedAttemptWeight;

  const evaluate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setReportResult(null);

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

  const reportOnchain = useCallback(
    async (force = false) => {
      setReporting(true);
      setError(null);

      try {
        const response = await fetch("/api/chainlink/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: watchAddress,
            thresholdSeconds,
            weight,
            force,
          }),
        });

        const body = (await response.json()) as ReportResponse & { error?: string };

        if (!response.ok) {
          throw new Error(body.error ?? body.message ?? `HTTP ${response.status}`);
        }

        setReportResult(body);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Onchain report failed");
        setReportResult(null);
      } finally {
        setReporting(false);
      }
    },
    [watchAddress, thresholdSeconds, weight],
  );

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
          <PulseButton variant="secondary" className="shrink-0" disabled={loading || reporting} onClick={evaluate}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Simulate adapter
          </PulseButton>
          <PulseButton
            variant="primary"
            className="shrink-0"
            disabled={loading || reporting || !result}
            onClick={() => reportOnchain(canReport ? false : true)}
          >
            <Zap className={`mr-2 h-4 w-4 ${reporting ? "animate-pulse" : ""}`} />
            Report onchain (CRE)
          </PulseButton>
        </div>
      </div>

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

      {reportResult?.txHash ? (
        <div className="mt-4 rounded-2xl border border-success/30 bg-success/5 p-4 text-sm">
          <p className="font-medium text-success">Signal reported on Sepolia</p>
          <p className="mt-2 font-mono text-xs break-all">tx: {reportResult.txHash}</p>
          {reportResult.walrusBlobId ? (
            <p className="mt-1 font-mono text-xs break-all">Walrus: {reportResult.walrusBlobId}</p>
          ) : null}
          {reportResult.explorerUrl ? (
            <a
              href={reportResult.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs link link-primary"
            >
              View on Etherscan
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : null}
        </div>
      ) : null}

      {!canReport && result ? (
        <p className="mt-3 text-xs text-pulse-muted">
          Report button uses demo override when threshold not met. Requires <code>CRE_ADAPTER_PRIVATE_KEY</code> in{" "}
          <code>.env.local</code>.
        </p>
      ) : null}
    </section>
  );
};
