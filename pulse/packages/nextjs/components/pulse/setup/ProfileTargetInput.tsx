"use client";

import { useEffect, useMemo, useState } from "react";
import { type Address, isAddress } from "viem";
import { useAccount } from "wagmi";
import { CopyRow } from "~~/components/pulse";
import { computeProfileId } from "~~/utils/pulse/profileId";
import { normalizeAddress } from "~~/utils/pulse/explorerAddress";

type ProfileTargetInputProps = {
  ownerAddress: string;
  onOwnerAddressChange: (value: string) => void;
  disabled?: boolean;
};

export const ProfileTargetInput = ({
  ownerAddress,
  onOwnerAddressChange,
  disabled,
}: ProfileTargetInputProps) => {
  const { address: consumerAddress } = useAccount();
  const [touched, setTouched] = useState(false);

  const profileId = useMemo(() => {
    if (!consumerAddress || !ownerAddress || !isAddress(ownerAddress)) return null;
    return computeProfileId(normalizeAddress(ownerAddress) as Address, normalizeAddress(consumerAddress) as Address);
  }, [ownerAddress, consumerAddress]);

  const showError = touched && ownerAddress.length > 0 && !isAddress(ownerAddress);

  return (
    <section className="pulse-card p-5 sm:p-6">
      <h2 className="pulse-section-title mb-1">Profile</h2>
      <p className="mb-4 text-sm text-pulse-muted">
        Owner address for this profile. Combined with your wallet, this determines profileId.
      </p>

      <label className="form-control w-full">
        <span className="label-text mb-2 text-xs text-pulse-muted">Owner address</span>
        <input
          type="text"
          className={`input input-bordered w-full rounded-xl font-mono text-sm ${showError ? "input-error" : ""}`}
          placeholder="0x…"
          value={ownerAddress}
          disabled={disabled}
          onChange={event => onOwnerAddressChange(event.target.value)}
          onBlur={() => setTouched(true)}
        />
      </label>

      {showError ? <p className="mt-2 text-xs text-error">Enter a valid Ethereum address.</p> : null}

      {profileId ? (
        <div className="mt-4">
          <CopyRow label="profileId" value={profileId} />
        </div>
      ) : null}

      {consumerAddress ? (
        <p className="mt-3 text-xs text-pulse-muted">
          Integration wallet: <span className="font-mono">{normalizeAddress(consumerAddress)}</span>
        </p>
      ) : null}
    </section>
  );
};
