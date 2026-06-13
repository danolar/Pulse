"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import { PROFILE_NOT_FOUND } from "~~/constants/explorerCopy";
import { normalizeAddress } from "~~/utils/pulse/explorerAddress";

export const ProfileNotFound = ({ address }: { address: string }) => {
  const { address: connected } = useAccount();
  const isOwn = connected && normalizeAddress(connected) === normalizeAddress(address);

  return (
    <div className="pulse-card mx-auto max-w-lg p-8 text-center">
      <p className="text-sm text-pulse-muted">{PROFILE_NOT_FOUND(address)}</p>
      {isOwn ? (
        <Link href="/setup" className="mt-4 inline-block">
          <PulseButton>Configure your profile</PulseButton>
        </Link>
      ) : null}
    </div>
  );
};

export const ViewingBanner = ({ address }: { address: string }) => (
  <div className="rounded-2xl border border-base-content/10 bg-base-200/40 px-4 py-3 text-sm text-pulse-muted">
    Viewing{" "}
    <span className="font-mono text-xs text-base-content">
      {address.slice(0, 6)}…{address.slice(-4)}
    </span>
    . Connect this profile&apos;s wallet to enable owner actions.
  </div>
);

export const ConnectToActNote = () => (
  <p className="rounded-2xl border border-base-content/10 bg-base-200/40 px-4 py-3 text-sm text-pulse-muted">
    Connect the profile owner&apos;s wallet or a verified requestor wallet to enable actions.
  </p>
);
