"use client";

import Link from "next/link";
import { PageShell, SectionHeader } from "~~/components/pulse";
import { AttemptSequence } from "~~/components/pulse/console/AttemptSequence";
import { ChainlinkActivityPanel } from "~~/components/pulse/chainlink/ChainlinkActivityPanel";
import { ConsoleSignalTimeline } from "~~/components/pulse/console/ConsoleSignalTimeline";
import { OwnerRequestorActions } from "~~/components/pulse/console/OwnerRequestorActions";
import { PulseConsoleGauge } from "~~/components/pulse/console/PulseConsoleGauge";
import { usePulseStore } from "~~/services/store/pulseStore";

const ConsolePage = () => {
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
        <SectionHeader title="Pulse console" subtitle="Complete setup before using the live demo console." />
        <div className="pulse-card max-w-2xl p-6">
          <p className="text-sm text-pulse-muted">
            Create a profile, bind Orb identity, save configuration, and authorize adapters before opening the console.
          </p>
          <Link href="/setup" className="btn btn-primary mt-4">
            Go to Setup
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <SectionHeader
        title="Pulse console"
        subtitle={`Profile ${profileId ?? "unknown"} · mock state until PulseOracle is deployed.`}
      />

      <div className="space-y-6">
        <PulseConsoleGauge
          accumulatedWeight={accumulatedWeight}
          threshold={config.threshold}
          lifecycle={lifecycle}
          epoch={epoch}
        />

        <OwnerRequestorActions actingAs={actingAs} lifecycle={lifecycle} orbBound={orbBound} profileId={profileId} />

        <AttemptSequence attempts={attempts} />

        <ChainlinkActivityPanel />

        <ConsoleSignalTimeline signals={signals} />
      </div>
    </PageShell>
  );
};

export default ConsolePage;
