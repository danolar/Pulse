"use client";

import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

export const ConnectVacant = () => (
  <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
    <div className="pulse-card mx-auto flex w-full max-w-md flex-col items-center gap-4 p-8 text-center">
      <p className="text-sm text-pulse-muted">Connect wallet to begin</p>
      <RainbowKitCustomConnectButton />
    </div>
  </div>
);
