"use client";

import { useAccount } from "wagmi";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import { StatusTag } from "~~/components/pulse/ui/StatusTag";
import { usePulseStore } from "~~/services/store/pulseStore";

export const ActiveAdapterList = () => {
  const { adapters, setModuleAdapter, mockRevokeProfileAdapter } = usePulseStore();
  const active = adapters.filter(adapter => adapter.address?.trim());

  return (
    <section className="pulse-card p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="pulse-section-title">Active signal adapters</h2>
          <p className="mt-1 text-sm text-pulse-muted">
            Adapters authorized on this profileId. Configure credentials in{" "}
            <Link href="/adapters" className="link link-primary">
              Adapters
            </Link>
            , then activate here.
          </p>
        </div>
        <Link href="/adapters">
          <PulseButton variant="secondary" className="btn-sm gap-1.5">
            Manage adapters
            <ExternalLink className="h-3.5 w-3.5" />
          </PulseButton>
        </Link>
      </div>

      {active.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-base-content/15 px-4 py-10 text-center">
          <p className="mb-1 text-sm font-medium text-base-content">No adapters on this profile</p>
          <p className="mb-4 text-sm text-pulse-muted">
            Configure credentials in Adapters, then activate signers on this profile.
          </p>
          <Link href="/adapters">
            <PulseButton>Open Adapters</PulseButton>
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-base-content/10">
          <table className="table table-sm">
            <thead>
              <tr className="text-pulse-muted">
                <th>Adapter</th>
                <th className="hidden sm:table-cell">Signer</th>
                <th className="w-28">Weight</th>
                <th className="w-24" />
              </tr>
            </thead>
            <tbody>
              {active.map(adapter => (
                <tr key={adapter.id}>
                  <td>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{adapter.label}</span>
                      {adapter.typeLabel ? (
                        <StatusTag label={adapter.typeLabel} tone="neutral" />
                      ) : null}
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-pulse-muted sm:hidden">{adapter.address}</p>
                  </td>
                  <td className="hidden font-mono text-xs sm:table-cell">{adapter.address}</td>
                  <td>
                    {adapter.weight > 0 ? (
                      <input
                        type="number"
                        min={1}
                        className="input input-bordered input-sm h-9 w-full min-w-[4.5rem] rounded-xl text-center font-mono"
                        value={adapter.weight}
                        onChange={event => {
                          const weight = Number(event.target.value);
                          if (adapter.moduleId && weight > 0) {
                            setModuleAdapter(adapter.moduleId, { weight });
                          }
                        }}
                      />
                    ) : (
                      <span className="text-xs text-pulse-muted">Gate · 0</span>
                    )}
                  </td>
                  <td>
                    <PulseButton
                      variant="ghost"
                      className="btn-xs"
                      onClick={() => mockRevokeProfileAdapter(adapter.id)}
                    >
                      Remove
                    </PulseButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
