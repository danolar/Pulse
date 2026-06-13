"use client";

import Link from "next/link";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import { StatusTag } from "~~/components/pulse/ui/StatusTag";
import { NumberField } from "~~/components/pulse/ui/NumberField";
import { usePulseStore } from "~~/services/store/pulseStore";

export const ActiveAdapterList = () => {
  const { adapters, mockRevokeProfileAdapter, setModuleAdapter } = usePulseStore();
  const active = adapters.filter(adapter => adapter.address?.trim());

  return (
    <section className="pulse-card p-5 sm:p-6">
      <div className="mb-5 space-y-3">
        <h2 className="pulse-section-title">Active signal adapters</h2>
        <p className="text-sm text-pulse-muted">
          Adapters authorized on this profile. Configure credentials and bind signers in{" "}
          <Link href="/adapters" className="link link-primary">
            Adapters
          </Link>{" "}
          first, then activate them here.
        </p>
      </div>

      {active.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-base-content/15 px-4 py-8 text-center">
          <p className="mb-4 text-sm text-pulse-muted">No adapters on this profile yet.</p>
          <Link href="/adapters">
            <PulseButton variant="secondary">Add adapters</PulseButton>
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {active.map(adapter => (
            <li
              key={adapter.id}
              className="rounded-2xl border border-base-content/10 bg-base-200/40 p-4"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="pulse-item-title">{adapter.label}</span>
                  {adapter.typeLabel ? (
                    <span className="ml-2 text-xs text-pulse-muted">{adapter.typeLabel}</span>
                  ) : null}
                </div>
                {adapter.capabilities ? (
                  <StatusTag label={adapter.capabilities} tone="neutral" />
                ) : null}
              </div>
              <p className="mb-3 font-mono text-xs text-pulse-muted">{adapter.address}</p>
              {adapter.weight > 0 ? (
                <NumberField
                  label="Weight"
                  unit="points"
                  value={adapter.weight}
                  onChange={weight => {
                    if (adapter.moduleId) setModuleAdapter(adapter.moduleId, { weight });
                  }}
                />
              ) : (
                <p className="text-xs text-pulse-muted">Decision gate · weight 0</p>
              )}
              <PulseButton
                variant="ghost"
                className="btn-sm mt-3"
                onClick={() => mockRevokeProfileAdapter(adapter.id)}
              >
                Deactivate
              </PulseButton>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4">
        <Link href="/adapters">
          <PulseButton variant="secondary">Add from catalog</PulseButton>
        </Link>
      </div>
    </section>
  );
};
