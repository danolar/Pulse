"use client";

import { useAccount } from "wagmi";
import { PageShell, SectionHeader } from "~~/components/pulse";
import { AttemptSequence } from "~~/components/pulse/console/AttemptSequence";
import { ChainlinkActivityPanel } from "~~/components/pulse/chainlink/ChainlinkActivityPanel";
import { ConsoleSignalTimeline } from "~~/components/pulse/console/ConsoleSignalTimeline";
import { OwnerRequestorActions } from "~~/components/pulse/console/OwnerRequestorActions";
import { PulseConsoleGauge } from "~~/components/pulse/console/PulseConsoleGauge";
import { RouteGuard } from "~~/components/pulse/layout/RouteGuard";
import { useResolvedActingRole } from "~~/hooks/pulse/useResolvedActingRole";
import { usePulseStore } from "~~/services/store/pulseStore";

const Console = () => {
  const { address } = useAccount();
  const actingAs = useResolvedActingRole();
  const { profileId, orbBound, lifecycle, epoch, accumulatedWeight, config, attempts, signals } = usePulseStore();

  const ownerRef = profileId ?? address ?? "unknown";

  return (
    <PageShell>
      <SectionHeader
        title="pulse console"
        eyebrow={`profile ${ownerRef}`}
        subtitle="local pulse oracle · mock lifecycle until full contract wiring"
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

const ConsolePage = () => (
  <RouteGuard requireProfile>
    <Console />
  </RouteGuard>
);

export default ConsolePage;
