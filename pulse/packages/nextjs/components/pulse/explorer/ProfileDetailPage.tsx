"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { PageShell, SectionHeader } from "~~/components/pulse";
import { EncryptedSignalFeed } from "~~/components/pulse/explorer/EncryptedSignalFeed";
import { ExplorerBrowseNote } from "~~/components/pulse/explorer/ExplorerBrowseNote";
import {
  ProfileHeader,
  PublicViewNote,
  SignalCountByContext,
} from "~~/components/pulse/explorer/ExplorerPublicProfile";
import { ProfileNotFound } from "~~/components/pulse/explorer/ProfileBanners";
import { usePublicSignalFeed } from "~~/hooks/pulse/usePublicSignalFeed";
import { isEthAddress, pushRecentSearch } from "~~/utils/pulse/explorerAddress";

export const ProfileDetailPage = () => {
  const params = useParams<{ address: string }>();
  const rawAddress = params.address ?? "";
  const profileAddress = isEthAddress(rawAddress) ? rawAddress : "";
  const feed = usePublicSignalFeed(profileAddress);

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

  if (!feed.hasActivity) {
    return (
      <PageShell>
        <SectionHeader title="Profile lookup" eyebrow="explorer" subtitle={profileAddress} />
        <ProfileNotFound address={profileAddress} />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <SectionHeader
        title="Pulse activity"
        eyebrow="public explorer"
        subtitle="Encrypted Walrus evidence only — no decoded weights or lifecycle"
      />

      <div className="space-y-6">
        <ExplorerBrowseNote />
        <PublicViewNote />
        <ProfileHeader ownerAddress={profileAddress} />
        <EncryptedSignalFeed ownerAddress={profileAddress} />
        <SignalCountByContext ownerAddress={profileAddress} />
      </div>
    </PageShell>
  );
};
