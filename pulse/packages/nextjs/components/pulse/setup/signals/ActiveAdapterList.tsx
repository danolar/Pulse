"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import { StatusTag } from "~~/components/pulse/ui/StatusTag";
import type { ConfiguredAdapter, SignalAdapter } from "~~/types/pulse";
import { usePulseStore } from "~~/services/store/pulseStore";

type AdapterRowModel = {
  catalogId: string;
  name: string;
  typeLabel: string;
  adapterAddress: string;
  suggestedWeight: number;
  isDecisionLayer?: boolean;
  profileAdapter: SignalAdapter | null;
  isActive: boolean;
};

const buildRows = (
  configuredAdapters: ConfiguredAdapter[],
  adapters: SignalAdapter[],
): AdapterRowModel[] =>
  configuredAdapters.map(configured => {
    const profileAdapter =
      adapters.find(
        adapter => adapter.moduleId === configured.catalogId && adapter.address?.trim(),
      ) ?? null;

    return {
      catalogId: configured.catalogId,
      name: configured.name,
      typeLabel: configured.typeLabel,
      adapterAddress: configured.adapterAddress,
      suggestedWeight: configured.weight,
      isDecisionLayer: configured.isDecisionLayer,
      profileAdapter,
      isActive: Boolean(profileAdapter),
    };
  });

export const ActiveAdapterList = () => {
  const {
    configuredAdapters,
    adapters,
    setModuleAdapter,
    mockRevokeProfileAdapter,
    mockAuthorizeProfileAdapter,
  } = usePulseStore();

  const rows = useMemo(
    () => buildRows(configuredAdapters, adapters),
    [configuredAdapters, adapters],
  );

  const inactiveCount = rows.filter(row => !row.isActive).length;

  const activateAll = () => {
    for (const row of rows) {
      if (!row.isActive) {
        mockAuthorizeProfileAdapter(row.catalogId, row.suggestedWeight);
      }
    }
  };

  return (
    <section className="pulse-card p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="pulse-section-title">Signal adapters on this profile</h2>
          <p className="mt-1 text-sm text-pulse-muted">
            Adapters configured in{" "}
            <Link href="/adapters" className="link link-primary">
              Adapters
            </Link>{" "}
            appear here. Toggle which ones are active for this profileId and set their weight.
          </p>
        </div>
        <Link href="/adapters">
          <PulseButton variant="secondary" className="btn-sm gap-1.5">
            Manage credentials
            <ExternalLink className="h-3.5 w-3.5" />
          </PulseButton>
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-base-content/15 px-4 py-10 text-center">
          <p className="mb-1 text-sm font-medium text-base-content">No adapters configured yet</p>
          <p className="mb-4 text-sm text-pulse-muted">
            Add API credentials in Adapters first — they will show up here to activate on this profile.
          </p>
          <Link href="/adapters">
            <PulseButton>Open Adapters</PulseButton>
          </Link>
        </div>
      ) : (
        <>
          {inactiveCount > 1 ? (
            <div className="mb-4 flex justify-end">
              <PulseButton variant="secondary" className="btn-sm gap-1.5" onClick={activateAll}>
                <Plus className="h-3.5 w-3.5" />
                Activate all ({inactiveCount})
              </PulseButton>
            </div>
          ) : null}

          <div className="overflow-hidden rounded-2xl border border-base-content/10">
            <table className="table table-sm">
              <thead>
                <tr className="text-pulse-muted">
                  <th>Adapter</th>
                  <th>Status</th>
                  <th className="hidden sm:table-cell">Signer</th>
                  <th className="w-28">Weight</th>
                  <th className="w-32 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.catalogId} className={row.isActive ? "" : "bg-base-200/30"}>
                    <td>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{row.name}</span>
                        <StatusTag label={row.typeLabel} tone="neutral" />
                      </div>
                      <p className="mt-1 font-mono text-[11px] text-pulse-muted sm:hidden">
                        {row.adapterAddress}
                      </p>
                    </td>
                    <td>
                      <StatusTag
                        label={row.isActive ? "On profile" : "Configured"}
                        tone={row.isActive ? "success" : "neutral"}
                      />
                    </td>
                    <td className="hidden font-mono text-xs sm:table-cell">{row.adapterAddress}</td>
                    <td>
                      {row.isActive && row.profileAdapter ? (
                        row.profileAdapter.weight > 0 ? (
                          <input
                            type="number"
                            min={1}
                            className="input input-bordered input-sm h-9 w-full min-w-[4.5rem] rounded-xl text-center font-mono"
                            value={row.profileAdapter.weight}
                            onChange={event => {
                              const weight = Number(event.target.value);
                              if (weight > 0) {
                                setModuleAdapter(row.catalogId, { weight });
                              }
                            }}
                          />
                        ) : (
                          <span className="text-xs text-pulse-muted">Gate · 0</span>
                        )
                      ) : (
                        <span className="text-xs text-pulse-muted">{row.suggestedWeight} suggested</span>
                      )}
                    </td>
                    <td className="text-right">
                      {row.isActive && row.profileAdapter ? (
                        <PulseButton
                          variant="ghost"
                          className="btn-xs"
                          onClick={() => mockRevokeProfileAdapter(row.profileAdapter!.id)}
                        >
                          Remove
                        </PulseButton>
                      ) : (
                        <PulseButton
                          variant="secondary"
                          className="btn-xs gap-1"
                          onClick={() =>
                            mockAuthorizeProfileAdapter(row.catalogId, row.suggestedWeight)
                          }
                        >
                          <Plus className="h-3 w-3" />
                          Add
                        </PulseButton>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {inactiveCount > 0 ? (
            <p className="mt-3 text-xs text-pulse-muted">
              {inactiveCount} configured adapter{inactiveCount === 1 ? "" : "s"} not yet on this profile — use{" "}
              <span className="font-medium text-base-content">Add</span> in the row above.
            </p>
          ) : null}
        </>
      )}
    </section>
  );
};
