"use client";

import { useAccount } from "wagmi";
import { normalizeAddress } from "~~/utils/pulse/explorerAddress";

export const ConsumerAdminNote = () => {
  const { address } = useAccount();

  return (
    <section className="rounded-2xl border border-primary/25 bg-primary/5 px-4 py-4 sm:px-5">
      <p className="pulse-label mb-2 text-primary">Consumer administrator</p>
      <p className="text-sm leading-relaxed text-pulse-muted">
        The connected wallet{" "}
        {address ? (
          <span className="font-mono text-xs text-base-content">{normalizeAddress(address)}</span>
        ) : (
          "—"
        )}{" "}
        is the sole administrator of this integration — equivalent to the address that deploys a contract. Only
        this wallet can create or modify this configuration. It is stored in your Neon PostgreSQL database and
        applies to every profile your app creates via{" "}
        <span className="font-mono text-xs">createProfile</span> onchain.
      </p>
      <p className="mt-2 text-xs text-pulse-muted">
        End-user profiles and requestors are created from your consumer app at scale, not entered manually here.
      </p>
    </section>
  );
};
