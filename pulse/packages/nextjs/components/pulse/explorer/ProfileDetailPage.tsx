"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { PageShell, SectionHeader } from "~~/components/pulse";
import { AttemptSequence } from "~~/components/pulse/console/AttemptSequence";
import { ChainlinkActivityPanel } from "~~/components/pulse/chainlink/ChainlinkActivityPanel";
import { ProfileActions } from "~~/components/pulse/explorer/ProfileActions";
import { PulseHeader } from "~~/components/pulse/explorer/PulseHeader";
import { ProfileNotFound, ViewingBanner } from "~~/components/pulse/explorer/ProfileBanners";
import { SignalTimeline } from "~~/components/pulse/explorer/SignalTimeline";
import { useProfileByAddress, useProfileRole } from "~~/hooks/pulse/useProfileByAddress";
import { isEthAddress, pushRecentSearch } from "~~/utils/pulse/explorerAddress";

export const ProfileDetailPage = () => {
  const params = useParams<{ address: string }>();
  const rawAddress = params.address ?? "";
  const profileAddress = isEthAddress(rawAddress) ? rawAddress : "";
  const { address: connected } = useAccount();

  const profile = useProfileByAddress(profileAddress);
  const role = useProfileRole(profileAddress, profile.requestors);

  useEffect(() => {
    if (profileAddress) pushRecentSearch(profileAddress);
  }, [profileAddress]);

  if (!profileAddress) {
    return (
      <PageShell>
        <p className="text-sm text-pulse-muted">Invalid profile address.</p>
      </PageShell>
    );
  }

  if (!profile.exists) {
    return (
      <PageShell>
        <SectionHeader title="Profile lookup" eyebrow="explorer" subtitle={profileAddress} />
        <ProfileNotFound address={profileAddress} />
      </PageShell>
    );
  }

  const showViewingBanner =
    connected && connected.toLowerCase() !== profileAddress.toLowerCase() && role !== "requestor";

  return (
    <PageShell>
      <SectionHeader
        title="Pulse profile"
        eyebrow={profileAddress}
        subtitle={`epoch ${profile.epoch} · ${profile.lifecycle}`}
      />

      <div className="space-y-6">
        {showViewingBanner ? <ViewingBanner address={profileAddress} /> : null}

        <PulseHeader
          accumulatedWeight={profile.accumulatedWeight}
          threshold={profile.config.threshold}
          lifecycle={profile.lifecycle}
          epoch={profile.epoch}
        />

        <ProfileActions
          profileAddress={profileAddress}
          role={role}
          lifecycle={profile.lifecycle}
          orbBound={profile.orbBound}
          profileId={profile.profileId}
        />

        <AttemptSequence attempts={profile.attempts} profileRole={role} />

        <ChainlinkActivityPanel />

        <SignalTimeline signals={profile.signals} lifecycle={profile.lifecycle} />
      </div>
    </PageShell>
  );
};
