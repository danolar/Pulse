"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { PageShell, SectionHeader } from "~~/components/pulse";
import { AttemptSequence } from "~~/components/pulse/console/AttemptSequence";
import { ChainlinkActivityPanel } from "~~/components/pulse/chainlink/ChainlinkActivityPanel";
import { ConsoleSignalTimeline } from "~~/components/pulse/console/ConsoleSignalTimeline";
import { OwnerRequestorActions } from "~~/components/pulse/console/OwnerRequestorActions";
import { PulseConsoleGauge } from "~~/components/pulse/console/PulseConsoleGauge";
import { usePulseStore } from "~~/services/store/pulseStore";

const ConsolePage = () => {
  const { address } = useAccount();
  const {
    setupComplete,
    profileId,
    orbBound,
    lifecycle,
    epoch,
    accumulatedWeight,
    config,
    attempts,
    signals,
    actingAs,
  } = usePulseStore();

  if (!setupComplete) {
    return (
      <PageShell>
        <SectionHeader
          title="Pulse console"
          subtitle="Complete the setup wizard before monitoring a profile."
        />
        <div className="pulse-card max-w-2xl p-6">
          <p className="text-sm text-pulse-muted">
            Register with World ID (Device + Orb), save window configuration, and authorize adapters and requestors.
          </p>
          <Link href="/setup" className="btn btn-primary mt-4">
            Go to setup
          </Link>
        </div>
      </PageShell>
    );
  }

  const ownerRef = profileId ?? address ?? "unknown";

  return (
    <PageShell>
      <SectionHeader
        title="Pulse console"
        subtitle={`Profile ${ownerRef} · local PulseOracle · mock lifecycle until full contract wiring`}
      />

      <div className="space-y-6">
        <PulseConsoleGauge
          accumulatedWeight={accumulatedWeight}
          threshold={config.threshold}
          lifecycle={lifecycle}
          epoch={epoch}
        />

        <AttemptSequence attempts={attempts} />

        <ChainlinkActivityPanel />

        <OwnerRequestorActions
          actingAs={actingAs}
          lifecycle={lifecycle}
          orbBound={orbBound}
          profileId={profileId}
        />

        <ConsoleSignalTimeline signals={signals} />
      </div>
    </PageShell>
  );
};

export default ConsolePage;
