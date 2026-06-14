"use client";

import { CopyRow } from "~~/components/pulse/layout/CopyRow";
import { WORLD_ID_ACTION_PATTERNS } from "~~/constants/connectionKitContent";
import { WORLD_ID_CONFIG_CALLOUT } from "~~/constants/explorerCopy";

export const WorldIDConfigStatus = () => {
  const appId = process.env.NEXT_PUBLIC_WORLD_APP_ID ?? "";

  return (
    <section className="pulse-card p-5 sm:p-6">
      <h2 className="pulse-section-title mb-1">World ID</h2>
      <p className="mb-4 text-sm text-pulse-muted">{WORLD_ID_CONFIG_CALLOUT}</p>

      <CopyRow label="World ID app_id" value={appId || "Not configured"} />

      <div className="mt-4 overflow-x-auto rounded-xl border border-base-content/10">
        <table className="table table-xs">
          <thead>
            <tr>
              <th>Action</th>
              <th>String</th>
              <th>Level</th>
            </tr>
          </thead>
          <tbody>
            {WORLD_ID_ACTION_PATTERNS.map(row => (
              <tr key={row.flow}>
                <td>{row.flow}</td>
                <td className="font-mono text-[11px]">{row.pattern}</td>
                <td className="capitalize">{row.level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
