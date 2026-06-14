"use client";

import { useAccount } from "wagmi";
import { normalizeAddress } from "~~/utils/pulse/explorerAddress";

export const ConsumerAdminNote = () => {
  const { address } = useAccount();

  return (
    <section className="rounded-2xl border border-primary/25 bg-primary/5 px-4 py-4 sm:px-5">
      <p className="pulse-label mb-2 text-primary">Integration administrator</p>
      <p className="text-sm leading-relaxed text-pulse-muted">
        Only{" "}
        {address ? (
          <span className="font-mono text-xs text-base-content">{normalizeAddress(address)}</span>
        ) : (
          "the connected wallet"
        )}{" "}
        can edit this configuration. Profiles are created from your app.
      </p>
    </section>
  );
};
