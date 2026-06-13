"use client";

import { PageShell } from "~~/components/pulse";
import { AddressSearchBar } from "~~/components/pulse/explorer/AddressSearchBar";
import { RecentSearches } from "~~/components/pulse/explorer/RecentSearches";
import { EXPLORER_SEARCH_LABEL } from "~~/constants/explorerCopy";

const ExplorerPage = () => (
  <PageShell className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center gap-8 py-12">
    <div className="w-full max-w-lg space-y-4 text-center">
      <h1 className="pulse-section-title text-2xl">Pulse Explorer</h1>
      <p className="text-sm text-pulse-muted">{EXPLORER_SEARCH_LABEL}</p>
      <AddressSearchBar label={EXPLORER_SEARCH_LABEL} size="large" />
    </div>
    <RecentSearches />
  </PageShell>
);

export default ExplorerPage;
