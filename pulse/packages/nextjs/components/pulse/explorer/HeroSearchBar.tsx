"use client";

import { EXPLORER_HERO_CTA, EXPLORER_SEARCH_LABEL } from "~~/constants/explorerCopy";
import { AddressSearchBar } from "~~/components/pulse/explorer/AddressSearchBar";

export const HeroSearchBar = () => (
  <div className="mx-auto w-full max-w-lg space-y-3 text-center">
    <p className="text-sm text-pulse-muted">{EXPLORER_HERO_CTA}</p>
    <AddressSearchBar label={EXPLORER_SEARCH_LABEL} size="large" />
  </div>
);
