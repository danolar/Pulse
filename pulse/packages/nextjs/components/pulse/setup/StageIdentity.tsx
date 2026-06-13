"use client";

import { useAccount } from "wagmi";
import { PulseWorldIdButton } from "~~/components/pulse/world-id/PulseWorldIdButton";
import { VerifiedCheck } from "~~/components/pulse/ui/VerifiedCheck";
import { worldIdActions } from "~~/constants/pulseProtocol";
import { usePulseStore } from "~~/services/store/pulseStore";
import { notification } from "~~/utils/scaffold-eth/notification";
import type { PulseWorldIdVerification } from "~~/utils/worldIdProof";

const runVerifiedAction = (action: (verification: PulseWorldIdVerification) => void) => {
  return (verification: PulseWorldIdVerification) => {
    try {
      action(verification);
    } catch (error) {
      notification.error(error instanceof Error ? error.message : "Action rejected.");
    }
  };
};

/** Spec alias — wraps IDKitWidget + contract write path via PulseWorldIdButton. */
const WorldIDButton = PulseWorldIdButton;

const IdentityStep = ({
  profileKey,
  deviceVerified,
  onCreateProfile,
}: {
  profileKey: string;
  deviceVerified: boolean;
  onCreateProfile: (verification: PulseWorldIdVerification) => void;
}) => (
  <section className="pulse-card p-5 sm:p-6">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="pulse-section-title">Device identity</h2>
      <VerifiedCheck verified={deviceVerified} label="Device bound" />
    </div>
    <p className="mb-2 text-sm text-pulse-muted">
      Creates your profile and binds your Device identity. Profile key:{" "}
      <span className="font-mono text-xs">{profileKey}</span>
    </p>
    <p className="mb-4 text-xs text-pulse-muted">Connected wallet is the onchain profile owner.</p>
    <WorldIDButton
      level="device"
      action={worldIdActions.createProfile(profileKey)}
      signal={profileKey}
      label="Verify & create profile"
      disabled={deviceVerified}
      onVerified={runVerifiedAction(onCreateProfile)}
    />
  </section>
);

const OrbBindStep = ({
  profileKey,
  deviceVerified,
  orbBound,
  onBindOrb,
}: {
  profileKey: string;
  deviceVerified: boolean;
  orbBound: boolean;
  onBindOrb: (verification: PulseWorldIdVerification) => void;
}) => (
  <section className={`pulse-card p-5 sm:p-6 ${deviceVerified ? "" : "opacity-60"}`}>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="pulse-section-title">Orb identity</h2>
      <VerifiedCheck verified={orbBound} label="Orb bound" />
    </div>
    <p className="mb-2 text-sm text-pulse-muted">
      Separate Orb proof for the highest-assurance owner actions.
    </p>
    <p className="mb-4 text-xs text-pulse-muted">
      Unlock note: Orb binding unlocks freeze evaluation and reverse alarm controls in the console.
    </p>
    <WorldIDButton
      level="orb"
      action={worldIdActions.bindOrb(profileKey)}
      signal={profileKey}
      label="Bind Orb identity"
      disabled={!deviceVerified || orbBound}
      onVerified={runVerifiedAction(onBindOrb)}
    />
  </section>
);

const TestingCallout = () => (
  <p className="rounded-2xl border border-base-content/10 bg-base-200/40 px-4 py-3 text-xs leading-relaxed text-pulse-muted">
    In production, the consumer app initiates identity steps. Pulse Explorer exposes create-profile and bind-orb here
    for integration testing.
  </p>
);

export const StageIdentity = () => {
  const { address } = useAccount();
  const { deviceVerified, orbBound, mockCreateProfile, mockBindOrb } = usePulseStore();

  const profileKey = address ?? "pending";

  return (
    <div className="space-y-6">
      <IdentityStep
        profileKey={profileKey}
        deviceVerified={deviceVerified}
        onCreateProfile={verification => mockCreateProfile(profileKey, verification)}
      />
      <OrbBindStep
        profileKey={profileKey}
        deviceVerified={deviceVerified}
        orbBound={orbBound}
        onBindOrb={mockBindOrb}
      />
      <TestingCallout />
    </div>
  );
};
