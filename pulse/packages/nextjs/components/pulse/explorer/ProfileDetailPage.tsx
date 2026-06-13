"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { PageShell, SectionHeader } from "~~/components/pulse";
import { AttemptSequence } from "~~/components/pulse/console/AttemptSequence";
import { ExplorerBrowseNote } from "~~/components/pulse/explorer/ExplorerBrowseNote";
import { ProfileActions } from "~~/components/pulse/explorer/ProfileActions";
import { ProfileRequestorActions } from "~~/components/pulse/explorer/ProfileRequestorActions";
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
  const profileKey = profile.profileId ?? profileAddress;
  const hasActiveAttempt = profile.attempts.some(
    attempt => attempt.isActive && attempt.status === "revealed",
  );

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
  const isRequestor = role === "requestor";
  const showViewingBanner = Boolean(connected) && !isOwner && !isRequestor;

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

        <AttemptSequence
          attempts={profile.attempts}
          profileRole={role}
          lifecycle={profile.lifecycle}
          epoch={profile.epoch}
          responseWindowHours={profile.config.responseWindow}
          profileKey={profileKey}
        />

        <SignalTimeline signals={profile.signals} lifecycle={profile.lifecycle} />

        {isOwner ? (
          <ProfileActions
            profileKey={profileKey}
            lifecycle={profile.lifecycle}
            orbBound={profile.orbBound}
            hasActiveAttempt={hasActiveAttempt}
          />
        ) : null}

        {isRequestor ? (
          <ProfileRequestorActions profileKey={profileKey} lifecycle={profile.lifecycle} />
        ) : null}

        {role === "none" ? <ExplorerBrowseNote /> : null}
      </div>
    </PageShell>
  );
};
