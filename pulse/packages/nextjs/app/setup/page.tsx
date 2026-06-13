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
import { SetupStageBar } from "~~/components/pulse/setup/SetupStageBar";
import { RouteGuard } from "~~/components/pulse/layout/RouteGuard";
import { PulseWorldIdButton } from "~~/components/pulse/world-id/PulseWorldIdButton";
import { worldIdActions } from "~~/constants/pulseProtocol";
import { SHOW_SCAFFOLD_DEV_UI } from "~~/constants/pulseAppConfig";
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
    router.push("/console");
  };

  return (
    <>
      <PageShell className={SHOW_SCAFFOLD_DEV_UI ? "pb-64 sm:pb-72" : "pb-52 sm:pb-56"}>
        <SectionHeader
          title="profile setup"
          eyebrow="verification package"
          subtitle="configure signal sources, prove identity with World ID, then choose a monitoring rhythm."
        />

        <div className="space-y-6">
          <section id="setup-stage-package">
            <VerificationPackagePanel googleRefreshToken={googleRefreshToken} />
          </section>

          <div id="setup-stage-identity" className="space-y-6">
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
                {orbBound ? (
                  <span className="badge badge-sm border-none bg-accent/15 text-accent">Orb bound</span>
                ) : null}
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
          </div>

          <section
            id="setup-stage-rhythm"
            className={`pulse-card p-5 sm:p-6 ${deviceVerified ? "" : "opacity-60"}`}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="pulse-section-title">Stage 3 · Monitoring profile</h2>
              {configSaved ? (
                <span className="badge badge-sm border-none bg-success/15 text-success">Saved</span>
              ) : null}
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

          <div
            aria-hidden
            className={SHOW_SCAFFOLD_DEV_UI ? "min-h-8 sm:min-h-10" : "min-h-4"}
          />
        </div>
      </PageShell>

      <SetupStageBar />
    </>
  );
};

const SetupPage = () => (
  <RouteGuard>
    <SetupWizard />
  </RouteGuard>
);

export default SetupPage;
