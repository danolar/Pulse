"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { PageShell, SectionHeader } from "~~/components/pulse";
import { ExplorerBrowseNote } from "~~/components/pulse/explorer/ExplorerBrowseNote";
import { PulseHeader } from "~~/components/pulse/explorer/PulseHeader";
import { ProfileNotFound, ViewingBanner } from "~~/components/pulse/explorer/ProfileBanners";
import { SignalTimeline } from "~~/components/pulse/explorer/SignalTimeline";
import { WindowScheduleReadout } from "~~/components/pulse/explorer/WindowScheduleReadout";
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

  const isOwner = role === "owner";
  const showContextBanner = Boolean(connected) && !isOwner;

  return (
    <PageShell>
      <SectionHeader
        title="Pulse profile"
        eyebrow={profileAddress}
        subtitle="Onchain state · read-only audit view"
      />

      <div className="space-y-6">
        {showContextBanner ? <ViewingBanner address={profileAddress} /> : null}
        {!connected ? <ExplorerBrowseNote /> : null}

        <PulseHeader
          accumulatedWeight={profile.accumulatedWeight}
          threshold={profile.config.threshold}
          lifecycle={profile.lifecycle}
          epoch={profile.epoch}
        />

        <SignalTimeline
          signals={profile.signals}
          lifecycle={profile.lifecycle}
          accumulatedWeight={profile.accumulatedWeight}
          threshold={profile.config.threshold}
        />

        <WindowScheduleReadout
          attempts={profile.attempts}
          lifecycle={profile.lifecycle}
          epoch={profile.epoch}
          attemptsPerWindow={profile.config.attemptsPerWindow}
          responseWindowHours={profile.config.responseWindow}
          windowDurationDays={profile.config.windowDuration}
        />
      </div>
    </PageShell>
  );
};
