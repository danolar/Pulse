"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { PageShell, SectionHeader } from "~~/components/pulse";
import { AttemptSequence } from "~~/components/pulse/console/AttemptSequence";
import { ProfileActions } from "~~/components/pulse/explorer/ProfileActions";
import { ProfileRequestorActions } from "~~/components/pulse/explorer/ProfileRequestorActions";
import { PulseHeader } from "~~/components/pulse/explorer/PulseHeader";
import { SignalTimeline } from "~~/components/pulse/explorer/SignalTimeline";
import { WindowScheduleReadout } from "~~/components/pulse/explorer/WindowScheduleReadout";
import { ConnectVacant } from "~~/components/pulse/layout/ConnectVacant";
import {
  useCanAccessProfileConsole,
  useProfileConsole,
  useProfileRole,
} from "~~/hooks/pulse/useProfileConsole";
import { usePulseStore } from "~~/services/store/pulseStore";
import { normalizeAddress } from "~~/utils/pulse/explorerAddress";

export const ProfileConsole = () => {
  const params = useParams<{ profileId: string }>();
  const profileId = params.profileId ?? "";
  const { address } = useAccount();
  const loadProfile = usePulseStore(state => state.loadProfile);

  const canAccess = useCanAccessProfileConsole(profileId);
  const profile = useProfileConsole(profileId);
  const role = useProfileRole(profileId, profile.requestors, profile.ownerAddress);

  useEffect(() => {
    if (profileId && canAccess) {
      loadProfile(profileId);
    }
  }, [profileId, canAccess, loadProfile]);

  if (!address) {
    return (
      <PageShell>
        <ConnectVacant />
      </PageShell>
    );
  }

  if (!canAccess || !profile.exists) {
    return (
      <PageShell>
        <SectionHeader title="Profile" eyebrow="not found" />
        <p className="text-sm text-pulse-muted">Profile not found or access denied.</p>
      </PageShell>
    );
  }

  const ownerKey = profile.ownerAddress ? normalizeAddress(profile.ownerAddress) : profileId;
  const isOwner = role === "owner";
  const isRequestor = role === "requestor";
  const isConsumerReadOnly = role === "consumer";
  const hasActiveAttempt = profile.attempts.some(a => a.isActive && a.status === "revealed");

  return (
    <PageShell>
      <SectionHeader
        title="Profile"
        eyebrow={profile.profileId ?? profileId}
        subtitle={profile.ownerAddress ? `Owner ${normalizeAddress(profile.ownerAddress)}` : undefined}
      />

      <div className="space-y-6">
        {isConsumerReadOnly ? (
          <p className="rounded-2xl border border-base-content/10 bg-base-200/40 px-4 py-3 text-sm text-pulse-muted">
            Read-only — you are monitoring this profile as the integrating app.
          </p>
        ) : null}

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

        {isOwner ? (
          <ProfileActions
            profileKey={ownerKey}
            lifecycle={profile.lifecycle}
            orbBound={profile.orbBound}
            hasActiveAttempt={hasActiveAttempt}
          />
        ) : null}

        {isRequestor ? (
          <ProfileRequestorActions profileKey={ownerKey} lifecycle={profile.lifecycle} />
        ) : null}

        <AttemptSequence
          attempts={profile.attempts}
          profileRole={isOwner ? "owner" : isRequestor ? "requestor" : "none"}
          lifecycle={profile.lifecycle}
          epoch={profile.epoch}
          responseWindowHours={profile.config.responseWindow}
          profileKey={ownerKey}
          showKeeperActions={isConsumerReadOnly}
        />
      </div>
    </PageShell>
  );
};
