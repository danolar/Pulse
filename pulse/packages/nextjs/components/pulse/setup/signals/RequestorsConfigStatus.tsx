"use client";

import { WORLD_ID_ACTION_PATTERNS } from "~~/constants/connectionKitContent";
import { REQUESTORS_CONFIG_CALLOUT } from "~~/constants/explorerCopy";

const REQUESTOR_FLOWS = ["Claim requestor slot", "Request evaluation"] as const;

export const RequestorsConfigStatus = () => {
  const requestorPatterns = WORLD_ID_ACTION_PATTERNS.filter(row =>
    REQUESTOR_FLOWS.includes(row.flow as (typeof REQUESTOR_FLOWS)[number]),
  );

  return (
    <section className="pulse-card p-5 sm:p-6">
      <h2 className="pulse-section-title mb-1">Trusted requestors</h2>
      <p className="mb-4 text-sm text-pulse-muted">
        Per-profile authorization — handled by your connected app, not configured globally here.
      </p>

      <div className="overflow-x-auto rounded-xl border border-base-content/10">
        <table className="table table-xs">
          <thead>
            <tr>
              <th>Flow</th>
              <th>Action string</th>
              <th>Level</th>
            </tr>
          </thead>
          <tbody>
            {requestorPatterns.map(row => (
              <tr key={row.flow}>
                <td>{row.flow}</td>
                <td className="font-mono text-[11px]">{row.pattern}</td>
                <td className="capitalize">{row.level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 rounded-2xl border border-base-content/10 bg-base-200/40 px-4 py-3 text-xs leading-relaxed text-pulse-muted">
        {REQUESTORS_CONFIG_CALLOUT}
      </p>
    </section>
  );
};
