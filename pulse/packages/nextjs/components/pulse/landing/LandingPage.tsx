"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { PulseMark } from "~~/components/pulse/brand/PulseMark";
import { PageShell } from "~~/components/pulse";
import { HeroSearchBar } from "~~/components/pulse/explorer/HeroSearchBar";
import { RecentSearches } from "~~/components/pulse/explorer/RecentSearches";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import { PULSE_TAGLINE } from "~~/constants/pulseBrand";
import { PULSE_EXPLORER_TOOL_NOTE, PULSE_WHAT_IS } from "~~/constants/explorerCopy";

const RadarHero = () => (
  <div className="relative mx-auto flex h-48 w-48 items-center justify-center sm:h-56 sm:w-56" aria-hidden>
    <div className="absolute inset-0 rounded-full border border-primary/10" />
    <div className="absolute inset-[12%] rounded-full border border-primary/15" />
    <div className="absolute inset-[24%] rounded-full border border-primary/20" />
    <div className="absolute inset-[36%] rounded-full border border-primary/25" />
    <PulseMark className="relative z-10 text-primary" size={44} />
    {[0, 1, 2, 3, 4].map(index => (
      <span
        key={index}
        className="absolute h-1.5 w-1.5 rounded-full bg-primary/70 motion-safe:animate-pulse"
        style={{
          top: `${20 + index * 14}%`,
          left: `${55 + (index % 2 === 0 ? 8 : -12)}%`,
          animationDelay: `${index * 0.35}s`,
        }}
      />
    ))}
  </div>
);

const TagOneLiner = () => (
  <p className="pulse-logo-tagline mx-auto max-w-xl text-center text-lg text-pulse-secondary sm:text-xl">
    {PULSE_TAGLINE}
  </p>
);

const WhatIsThisNote = () => (
  <div className="mx-auto max-w-2xl space-y-2 text-center text-sm leading-relaxed text-pulse-muted">
    <p>{PULSE_WHAT_IS}</p>
    <p>{PULSE_EXPLORER_TOOL_NOTE}</p>
  </div>
);

const DevEntryPoint = () => {
  const { address } = useAccount();

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-base-content/10 bg-base-200/40 px-5 py-4 text-center">
      <p className="mb-3 text-sm text-pulse-muted">
        Building with Pulse? Connect your wallet to manage your integration.
      </p>
      <Link href={address ? "/dashboard" : "/setup"}>
        <PulseButton variant="secondary" className="w-full sm:w-auto">
          {address ? "Open dashboard" : "Connect to get started"}
        </PulseButton>
      </Link>
    </div>
  );
};

export const LandingPage = () => (
  <PageShell className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center gap-8 py-12">
    <RadarHero />
    <TagOneLiner />
    <WhatIsThisNote />
    <HeroSearchBar />
    <DevEntryPoint />
    <RecentSearches />
    <Link href="/explorer" className="link link-hover text-xs text-pulse-muted">
      Open explorer
    </Link>
  </PageShell>
);
