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
      <section className="pulse-card p-5 sm:p-6">
        <h2 className="pulse-section-title mb-1">Onchain flows</h2>
        <p className="mb-4 text-sm text-pulse-muted">
          Exercise profile creation and Orb binding before shipping in your app. Does not change Setup.
        </p>
        <div className="flex flex-wrap gap-3">
          <PulseButton
            variant="secondary"
            disabled={!isAddress(ownerDraft) || deviceVerified}
            onClick={() => mockCreateProfile(ownerDraft, address, { mock: true, level: "device" })}
          >
            Create profile
          </PulseButton>
          <PulseButton
            variant="secondary"
            disabled={!deviceVerified || orbBound}
            onClick={() => mockBindOrb({ mock: true, level: "orb" })}
          >
            Bind Orb
          </PulseButton>
          <PulseButton
            disabled={!isAddress(ownerDraft)}
            onClick={() => mockSeedLabProfile(ownerDraft, address)}
          >
            Load demo profile
          </PulseButton>
        </div>
      </section>
    </div>
  );
};

const IntegrationLabContent = () => (
  <PageShell>
    <SectionHeader
      title="Test integration"
      eyebrow="sandbox"
      subtitle="Try onchain profile flows before wiring them in your app."
    />
    <div className="mb-4 rounded-2xl border border-base-content/10 bg-base-200/40 px-4 py-3 text-sm text-pulse-muted">
      Complete{" "}
      <Link href="/setup" className="link link-primary">
        Setup
      </Link>{" "}
      first.
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
