"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { PageShell, SectionHeader } from "~~/components/pulse";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import { StatusTag } from "~~/components/pulse/ui/StatusTag";
import { useProfilesByConsumer } from "~~/hooks/pulse/useProfileConsole";
import { LIFECYCLE_LABELS } from "~~/types/pulse";
import { normalizeAddress, truncateAddress } from "~~/utils/pulse/explorerAddress";

const ConsumerIdentity = () => {
  const { address } = useAccount();
  if (!address) return null;

  return (
    <div className="pulse-card p-5 sm:p-6">
      <p className="pulse-label mb-1">Consumer wallet</p>
      <p className="font-mono text-sm">{normalizeAddress(address)}</p>
      <p className="mt-2 text-sm text-pulse-muted">
        Profiles you manage as a consumer app (for example Legacy Ledger integration testing).
      </p>
    </div>
  );
};

export const DevDashboard = () => {
  const profiles = useProfilesByConsumer();

  return (
    <PageShell>
      <SectionHeader
        title="Developer dashboard"
        eyebrow="consumer context"
        subtitle="Manage profiles keyed by profileId = keccak256(owner, your wallet)."
      />

      <div className="space-y-6">
        <ConsumerIdentity />

        <section className="pulse-card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-content/10 px-5 py-4 sm:px-6">
            <div>
              <h2 className="pulse-section-title">Your profiles</h2>
              <p className="mt-1 text-sm text-pulse-muted">Decoded state and actions live on the profile console.</p>
            </div>
            <Link href="/setup">
              <PulseButton>Create profile</PulseButton>
            </Link>
          </div>

          {profiles.length === 0 ? (
            <div className="px-5 py-12 text-center sm:px-6">
              <p className="mb-2 text-sm font-medium">No profiles yet</p>
              <p className="mb-4 text-sm text-pulse-muted">
                Configure adapters, then run Setup to create a profile for an owner address.
              </p>
              <Link href="/setup">
                <PulseButton>Open Setup</PulseButton>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr className="text-pulse-muted">
                    <th>Owner</th>
                    <th>Lifecycle</th>
                    <th className="hidden md:table-cell">Weight / threshold</th>
                    <th className="hidden sm:table-cell">Last signal</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {profiles.map(profile => (
                    <tr key={profile.profileId}>
                      <td>
                        <span className="font-mono text-xs">{truncateAddress(profile.ownerAddress)}</span>
                      </td>
                      <td>
                        <StatusTag label={LIFECYCLE_LABELS[profile.lifecycle]} tone="neutral" />
                      </td>
                      <td className="hidden font-mono text-xs md:table-cell">
                        {profile.accumulatedWeight} / {profile.config.threshold}
                      </td>
                      <td className="hidden text-xs sm:table-cell">
                        {profile.lastSignalAt
                          ? new Date(profile.lastSignalAt).toLocaleDateString(undefined, { dateStyle: "medium" })
                          : "—"}
                      </td>
                      <td className="text-right">
                        <Link href={`/dashboard/${profile.profileId}`} className="btn btn-ghost btn-xs rounded-lg">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
};
