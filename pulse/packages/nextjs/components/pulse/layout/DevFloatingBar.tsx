"use client";

import Link from "next/link";
import { useFetchNativeCurrencyPrice } from "@scaffold-ui/hooks";
import { hardhat } from "viem/chains";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Faucet } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

export const DevFloatingBar = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const { price: nativeCurrencyPrice } = useFetchNativeCurrencyPrice();

  const showPrice = nativeCurrencyPrice > 0;

  if (!showPrice && !isLocalNetwork) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-0 left-0 z-10 flex w-full justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      aria-label="Development tools"
    >
      <div className="pointer-events-auto flex max-w-[calc(100vw-2rem)] items-center divide-x divide-base-content/10 overflow-hidden rounded-2xl border border-base-content/5 bg-base-100/95 shadow-pulse-md backdrop-blur-md">
        {showPrice ? (
          <div className="flex shrink-0 items-center gap-1.5 px-3 py-2 sm:px-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-pulse-muted">ETH</span>
            <span className="whitespace-nowrap text-sm font-semibold text-base-content">
              ${nativeCurrencyPrice.toFixed(2)}
            </span>
          </div>
        ) : null}

        {isLocalNetwork ? (
          <>
            <Link
              href="/debug"
              className="btn btn-ghost h-10 min-h-10 shrink-0 gap-1.5 rounded-none border-none px-3 font-normal shadow-none sm:px-4"
            >
              <BugAntIcon className="h-4 w-4 shrink-0" />
              <span className="hidden whitespace-nowrap sm:inline">Debug</span>
            </Link>
            <div className="[&_label.btn]:btn-ghost [&_label.btn]:h-10 [&_label.btn]:min-h-10 [&_label.btn]:rounded-none [&_label.btn]:border-none [&_label.btn]:px-3 [&_label.btn]:shadow-none sm:[&_label.btn]:px-4">
              <Faucet />
            </div>
            <Link
              href="/blockexplorer"
              className="btn btn-ghost h-10 min-h-10 shrink-0 gap-1.5 rounded-none border-none px-3 font-normal shadow-none sm:px-4"
            >
              <MagnifyingGlassIcon className="h-4 w-4 shrink-0" />
              <span className="hidden whitespace-nowrap sm:inline">Explorer</span>
            </Link>
          </>
        ) : null}
      </div>
    </div>
  );
};
