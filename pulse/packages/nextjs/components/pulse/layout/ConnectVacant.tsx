"use client";

import { PageShell } from "~~/components/pulse/layout/PageShell";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

export const ConnectVacant = () => (
  <PageShell>
    <div className="pulse-card mx-auto flex max-w-md flex-col items-center gap-4 p-8 text-center">
      <p className="text-sm text-pulse-muted">Connect wallet to begin</p>
      <RainbowKitCustomConnectButton />
    </div>
  </PageShell>
);
