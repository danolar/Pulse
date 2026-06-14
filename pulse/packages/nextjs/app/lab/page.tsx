"use client";

import { useState } from "react";
import { isAddress } from "viem";
import { useAccount } from "wagmi";
import Link from "next/link";
import { PageShell, SectionHeader } from "~~/components/pulse";
import { ProfileTargetInput } from "~~/components/pulse/setup/ProfileTargetInput";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import { RouteGuard } from "~~/components/pulse/layout/RouteGuard";
import { usePulseStore } from "~~/services/store/pulseStore";

const LabIdentityStep = () => {
  const { address } = useAccount();
  const [ownerDraft, setOwnerDraft] = useState(address ?? "");
  const { mockSeedLabProfile, mockCreateProfile, mockBindOrb, deviceVerified, orbBound } = usePulseStore();

  if (!address) return null;

  return (
    <div className="space-y-6">
      <ProfileTargetInput ownerAddress={ownerDraft} onOwnerAddressChange={setOwnerDraft} />
      <section className="pulse-card border-dashed border-warning/40 p-5 sm:p-6">
        <p className="pulse-label mb-2 text-warning">Integration lab only</p>
        <p className="mb-4 text-sm text-pulse-muted">
          Simulates what your consumer app does when a user onboards:{" "}
          <span className="font-mono text-xs">createProfile</span> + optional Orb bind. Does not modify your
          consumer configuration in Neon.
        </p>
        <div className="flex flex-wrap gap-3">
          <PulseButton
            variant="secondary"
            disabled={!isAddress(ownerDraft) || deviceVerified}
            onClick={() => mockCreateProfile(ownerDraft, address, { mock: true, level: "device" })}
          >
            Mock createProfile
          </PulseButton>
          <PulseButton
            variant="secondary"
            disabled={!deviceVerified || orbBound}
            onClick={() => mockBindOrb({ mock: true, level: "orb" })}
          >
            Mock bind Orb
          </PulseButton>
          <PulseButton
            disabled={!isAddress(ownerDraft)}
            onClick={() => mockSeedLabProfile(ownerDraft, address)}
          >
            Seed demo profile + signals
          </PulseButton>
        </div>
      </section>
    </div>
  );
};

const IntegrationLabContent = () => (
  <PageShell>
    <SectionHeader
      title="Integration lab"
      eyebrow="not configuration"
      subtitle="Contract writes and demo profiles for testing — separate from your consumer setup stored in Neon."
    />
    <div className="mb-4 rounded-2xl border border-base-content/10 bg-base-200/40 px-4 py-3 text-sm text-pulse-muted">
      Complete{" "}
      <Link href="/setup" className="link link-primary">
        consumer setup
      </Link>{" "}
      first. Use this page to validate onchain flows before wiring them in your app.
    </div>
    <LabIdentityStep />
  </PageShell>
);

export default function IntegrationLabPage() {
  return (
    <RouteGuard>
      <IntegrationLabContent />
    </RouteGuard>
  );
}
