"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { PageShell, PulseButton, SectionHeader } from "~~/components/pulse";
import {
  validateEnabledModulesForActivation,
  VerificationPackagePanel,
} from "~~/components/pulse/modules/VerificationPackagePanel";
import { MonitoringWindowSetup } from "~~/components/pulse/setup/MonitoringWindowSetup";
import { PulseWorldIdButton } from "~~/components/pulse/world-id/PulseWorldIdButton";
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

const SETUP_STEPS = [
  { label: "Package", detail: "Signals & connections" },
  { label: "Identity", detail: "World ID Device + Orb" },
  { label: "Rhythm", detail: "When Pulse checks on you" },
] as const;

const SetupWizard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address } = useAccount();
  const {
    profileId,
    deviceVerified,
    orbBound,
    configSaved,
    config,
    mockCreateProfile,
    mockBindOrb,
    mockSaveConfig,
    mockCompleteSetup,
  } = usePulseStore();

  const [fallbackProfileKey, setFallbackProfileKey] = useState<string | null>(null);
  const [googleRefreshToken, setGoogleRefreshToken] = useState(0);

  useEffect(() => {
    if (profileId || address) return;
    setFallbackProfileKey(`profile-${crypto.randomUUID().slice(0, 8)}`);
  }, [profileId, address]);

  useEffect(() => {
    const googleStatus = searchParams.get("google");
    if (!googleStatus) return;

    if (googleStatus === "connected") {
      usePulseStore.getState().ensureModuleEnabled("google-activity");
      setGoogleRefreshToken(current => current + 1);
      notification.success("Google account linked.");
    } else if (googleStatus === "error") {
      const reason = searchParams.get("reason") ?? "unknown";
      notification.error(`Google connection failed: ${decodeURIComponent(reason)}`);
    }

    router.replace("/setup");
  }, [router, searchParams]);

  const profileKey = profileId ?? address ?? fallbackProfileKey;
  const profileKeyLabel = profileKey ?? "Assigning profile key…";

  const handleActivate = () => {
    if (!validateEnabledModulesForActivation()) return;
    mockCompleteSetup();
    router.push("/");
  };

  return (
    <PageShell>
      <SectionHeader
        title="profile setup"
        eyebrow="verification package"
        subtitle="configure signal sources, prove identity with World ID, then choose a monitoring rhythm."
      />

      <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {SETUP_STEPS.map((step, index) => (
          <div
            key={step.label}
            className="rounded-2xl border border-base-content/10 bg-base-200/30 px-3 py-2.5 text-center"
          >
            <p className="pulse-label m-0 text-[10px]">Stage {index + 1}</p>
            <p className="pulse-item-title m-0">{step.label}</p>
            <p className="text-[11px] text-pulse-muted">{step.detail}</p>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <VerificationPackagePanel googleRefreshToken={googleRefreshToken} />

        <section className="pulse-card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="pulse-section-title">Stage 2a · Identity (Device)</h2>
            {deviceVerified ? (
              <span className="badge badge-sm border-none bg-success/15 text-success">Device bound</span>
            ) : null}
          </div>
          <p className="mb-2 text-sm text-pulse-muted">
            Creates your profile and binds your Device identity. Profile key:{" "}
            <span className="font-mono text-xs" suppressHydrationWarning>
              {profileKeyLabel}
            </span>
          </p>
          {address ? (
            <p className="mb-4 text-xs text-pulse-muted">Connected wallet becomes the onchain profile owner.</p>
          ) : (
            <p className="mb-4 text-xs text-warning">Connect a wallet to use your address as the profile key.</p>
          )}
          <PulseWorldIdButton
            level="device"
            action={worldIdActions.createProfile(profileKey ?? "pending")}
            signal={profileKey ?? "pending"}
            label="Verify & create profile"
            disabled={deviceVerified || !profileKey}
            onVerified={runVerifiedAction(v => {
              if (!profileKey) return;
              mockCreateProfile(profileKey, v);
            })}
          />
        </section>

        <section className={`pulse-card p-5 sm:p-6 ${deviceVerified ? "" : "opacity-60"}`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="pulse-section-title">Stage 2b · Identity (Orb)</h2>
            {orbBound ? <span className="badge badge-sm border-none bg-accent/15 text-accent">Orb bound</span> : null}
          </div>
          <p className="mb-4 text-sm text-pulse-muted">
            Unlocks block and resurrect — separate Orb proof, stronger assurance for emergency actions.
          </p>
          <PulseWorldIdButton
            level="orb"
            action={worldIdActions.bindOrb(profileKey ?? "pending")}
            signal={profileKey ?? "pending"}
            label="Bind Orb identity"
            disabled={!deviceVerified || orbBound || !profileKey}
            onVerified={runVerifiedAction(v => {
              if (!profileKey) return;
              mockBindOrb(v);
            })}
          />
        </section>

        <section className={`pulse-card p-5 sm:p-6 ${deviceVerified ? "" : "opacity-60"}`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="pulse-section-title">Stage 3 · Monitoring profile</h2>
            {configSaved ? <span className="badge badge-sm border-none bg-success/15 text-success">Saved</span> : null}
          </div>

          <MonitoringWindowSetup
            disabled={!deviceVerified}
            initialConfig={config}
            onSave={savedConfig => mockSaveConfig(savedConfig)}
          />

          <PulseButton className="mt-6" disabled={!configSaved} onClick={handleActivate}>
            Activate profile & open console
          </PulseButton>
        </section>
      </div>
    </PageShell>
  );
};

export default SetupWizard;
