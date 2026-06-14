"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { PageShell, SectionHeader } from "~~/components/pulse";
import { ExplorerBrowseNote } from "~~/components/pulse/explorer/ExplorerBrowseNote";
import { ExplorerProfileList } from "~~/components/pulse/explorer/ExplorerProfileList";
import { ProfileHeader, PublicViewNote } from "~~/components/pulse/explorer/ExplorerPublicProfile";
import { ProfileNotFound } from "~~/components/pulse/explorer/ProfileBanners";
import { useExplorerOwnerView } from "~~/hooks/pulse/useExplorerOwnerView";
import { isEthAddress, pushRecentSearch } from "~~/utils/pulse/explorerAddress";

export const ProfileDetailPage = () => {
  const params = useParams<{ address: string }>();
  const rawAddress = params.address ?? "";
  const profileAddress = isEthAddress(rawAddress) ? rawAddress : "";
  const view = useExplorerOwnerView(profileAddress);

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

  if (!view.hasActivity) {
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
        title="Pulse oracle activity"
        eyebrow="public explorer"
        subtitle="Public oracle activity for this address"
      />

      <div className="space-y-6">
        <ExplorerBrowseNote />
        <PublicViewNote />
        <ProfileHeader ownerAddress={profileAddress} />
        <ExplorerProfileList profiles={view.profiles} />
      </div>
    </PageShell>
  );
};
