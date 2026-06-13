"use client";

import { useEffect, useState } from "react";
import { CopyRow } from "~~/components/pulse/layout/CopyRow";
import { WORLD_ID_ACTION_PATTERNS } from "~~/constants/connectionKitContent";
import { WORLD_ID_CONFIG_CALLOUT, WORLD_ID_INTEGRATED_KEY } from "~~/constants/explorerCopy";

export const WorldIDConfigStatus = () => {
  const appId = process.env.NEXT_PUBLIC_WORLD_APP_ID ?? "";
  const [integrated, setIntegrated] = useState(false);

  useEffect(() => {
    setIntegrated(localStorage.getItem(WORLD_ID_INTEGRATED_KEY) === "true");
  }, []);

  const toggleIntegrated = () => {
    const next = !integrated;
    setIntegrated(next);
    localStorage.setItem(WORLD_ID_INTEGRATED_KEY, String(next));
  };

  return (
    <section className="pulse-card p-5 sm:p-6">
      <h2 className="pulse-section-title mb-1">World ID in your app</h2>
      <p className="mb-4 text-sm text-pulse-muted">
        Reference configuration for consumer apps. End users complete these verifications inside your product — not
        in Pulse Explorer.
      </p>

      <CopyRow label="World ID app_id" value={appId || "Not set — add NEXT_PUBLIC_WORLD_APP_ID"} />

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

      <p className="mt-4 rounded-2xl border border-base-content/10 bg-base-200/40 px-4 py-3 text-xs leading-relaxed text-pulse-muted">
        {WORLD_ID_CONFIG_CALLOUT}
      </p>

      <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="checkbox checkbox-primary checkbox-sm"
          checked={integrated}
          onChange={toggleIntegrated}
        />
        World ID integrated in my app (local checklist)
      </label>
    </section>
  );
};
