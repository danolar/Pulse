"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { PulseMark } from "~~/components/pulse/brand/PulseMark";
import { PageShell, PulseButton } from "~~/components/pulse";
import { PULSE_EXPLORER_NOTE, PULSE_TAGLINE } from "~~/constants/pulseBrand";
import { usePulseStore } from "~~/services/store/pulseStore";

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
  <p className="mx-auto max-w-2xl text-center text-sm leading-relaxed text-pulse-muted">{PULSE_EXPLORER_NOTE}</p>
);

export const LandingPage = () => {
  const router = useRouter();
  const { isConnected } = useAccount();
  const setupComplete = usePulseStore(state => state.setupComplete);

  const destination = setupComplete ? "/console" : "/setup";

  return (
    <PageShell className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center gap-8 py-12">
      <RadarHero />
      <TagOneLiner />
      <WhatIsThisNote />
      <div className="flex flex-col items-center gap-3">
        <PulseButton
          disabled={!isConnected}
          onClick={() => router.push(destination)}
          className="min-w-[12rem]"
        >
          {setupComplete ? "Open console" : "Start setup"}
        </PulseButton>
        {!isConnected ? (
          <p className="text-xs text-pulse-muted">Connect your wallet in the header to continue.</p>
        ) : null}
      </div>
      <Link href="/setup" className="link link-hover text-xs text-pulse-muted">
        Go to setup wizard
      </Link>
    </PageShell>
  );
};
