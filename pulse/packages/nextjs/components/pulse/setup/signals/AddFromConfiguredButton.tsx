"use client";

import { useMemo } from "react";
import Link from "next/link";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import { StatusTag } from "~~/components/pulse/ui/StatusTag";
import { usePulseStore } from "~~/services/store/pulseStore";

export const AddFromConfiguredButton = () => {
  const { configuredAdapters, adapters, mockAuthorizeProfileAdapter } = usePulseStore();

  const inactive = useMemo(
    () =>
      configuredAdapters.filter(
        configured =>
          !adapters.some(
            adapter => adapter.moduleId === configured.catalogId && adapter.address?.trim(),
          ),
      ),
    [configuredAdapters, adapters],
  );

  if (inactive.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-base-content/15 px-4 py-6 text-center">
        <p className="mb-2 text-sm text-pulse-muted">
          All configured adapters are active on this profile, or none are configured yet.
        </p>
        <Link href="/adapters">
          <PulseButton variant="secondary" className="btn-sm">
            Configure adapters
          </PulseButton>
        </Link>
      </div>
    );
  }

  return (
    <section className="pulse-card p-5 sm:p-6">
      <h3 className="mb-3 text-sm font-medium">Add from configured adapters</h3>
      <ul className="space-y-2">
        {inactive.map(adapter => (
          <li
            key={adapter.catalogId}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-base-content/10 px-4 py-3"
          >
            <div>
              <p className="font-medium">{adapter.name}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                <StatusTag label={adapter.typeLabel} tone="neutral" />
                <span className="text-xs text-pulse-muted">Suggested weight {adapter.weight}</span>
              </div>
            </div>
            <PulseButton
              variant="secondary"
              className="btn-sm"
              onClick={() => mockAuthorizeProfileAdapter(adapter.catalogId, adapter.weight)}
            >
              Activate on profile
            </PulseButton>
          </li>
        ))}
      </ul>
    </section>
  );
};
