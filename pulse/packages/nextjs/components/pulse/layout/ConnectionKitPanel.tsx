"use client";

import { useCallback } from "react";
import { Copy } from "lucide-react";
import deployedContracts from "~~/contracts/deployedContracts";
import { worldIdActions } from "~~/constants/pulseProtocol";
import { SlideOver } from "~~/components/pulse/layout/SlideOver";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { notification } from "~~/utils/scaffold-eth/notification";

type ConnectionKitPanelProps = {
  open: boolean;
  onClose: () => void;
};

const CopyRow = ({ label, value }: { label: string; value: string }) => {
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      notification.success(`${label} copied`);
    } catch {
      notification.error("Could not copy to clipboard");
    }
  }, [label, value]);

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl bg-base-200/60 px-3 py-2">
      <div className="min-w-0">
        <p className="text-xs font-medium text-pulse-muted">{label}</p>
        <p className="break-all font-mono text-xs">{value || "—"}</p>
      </div>
      <button
        type="button"
        className="btn btn-ghost btn-xs btn-square shrink-0"
        aria-label={`Copy ${label}`}
        disabled={!value}
        onClick={handleCopy}
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

const ACTION_ROWS = [
  { action: "createProfile", example: worldIdActions.createProfile("{address}") },
  { action: "bindOrb", example: worldIdActions.bindOrb("{address}") },
  { action: "checkin", example: worldIdActions.checkin("{address}") },
  { action: "block", example: worldIdActions.block("{address}") },
  { action: "resurrect", example: worldIdActions.resurrect("{address}") },
  { action: "requestEvaluation", example: worldIdActions.requestEvaluation("{owner}") },
] as const;

export const ConnectionKitPanel = ({ open, onClose }: ConnectionKitPanelProps) => {
  const { targetNetwork } = useTargetNetwork();
  const contractAddress =
    deployedContracts[targetNetwork.id as keyof typeof deployedContracts]?.PulseOracle?.address ?? "";
  const appId = process.env.NEXT_PUBLIC_WORLD_APP_ID ?? "";

  const snippet = `<IDKitWidget
  app_id="${appId || "app_..."}"
  action="${worldIdActions.checkin("{ownerAddress}")}"
  signal="{ownerAddress}"
  onSuccess={async (proof) => {
    await pulseOracle.write.checkin([/* proof fields */]);
  }}
/>`;

  return (
    <SlideOver open={open} title="Connection kit" onClose={onClose}>
      <div className="space-y-6 text-sm">
        <section className="space-y-2">
          <h3 className="pulse-label text-pulse-muted">Onchain & World ID</h3>
          <CopyRow label="PulseOracle contract" value={contractAddress} />
          <CopyRow label="World ID app_id" value={appId} />
          <CopyRow label="Network" value={targetNetwork.name} />
        </section>

        <section className="space-y-2">
          <h3 className="pulse-label text-pulse-muted">Action naming</h3>
          <div className="overflow-x-auto rounded-xl border border-base-content/10">
            <table className="table table-xs">
              <thead>
                <tr>
                  <th>Flow</th>
                  <th>Action string</th>
                </tr>
              </thead>
              <tbody>
                {ACTION_ROWS.map(row => (
                  <tr key={row.action}>
                    <td className="capitalize">{row.action}</td>
                    <td className="font-mono text-[11px]">{row.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="pulse-label text-pulse-muted">Integration snippet</h3>
          <pre className="overflow-x-auto rounded-xl bg-base-200/80 p-3 font-mono text-[11px] leading-relaxed">
            {snippet}
          </pre>
        </section>

        <section className="space-y-2">
          <h3 className="pulse-label text-pulse-muted">Docs</h3>
          <ul className="list-inside list-disc space-y-1 text-pulse-muted">
            <li>
              <a href="https://github.com/danolar/Pulse" className="link link-primary" target="_blank" rel="noreferrer">
                Repository & README
              </a>
            </li>
            <li>ABI: exported from deployedContracts in the Next.js package</li>
          </ul>
        </section>

        <p className="text-xs leading-relaxed text-pulse-muted">
          Pulse uses an implicit connection model: World ID actions and contract calls are keyed by profile address.
          No separate pairing step — connect a wallet, use the owner address as the profile key, and match action
          strings to the tables above.
        </p>
      </div>
    </SlideOver>
  );
};
