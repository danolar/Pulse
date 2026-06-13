"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageShell, SectionHeader } from "~~/components/pulse";
import { validateEnabledModulesForActivation } from "~~/components/pulse/modules/VerificationPackagePanel";
import { StageIdentity } from "~~/components/pulse/setup/StageIdentity";
import { StageRhythm } from "~~/components/pulse/setup/StageRhythm";
import { StageSignals } from "~~/components/pulse/setup/StageSignals";
import { WizardFooter } from "~~/components/pulse/setup/WizardFooter";
import {
  type SetupStageId,
  getDefaultSetupStage,
  getNextStage,
  getPreviousStage,
  getSetupStageProgress,
  isStageUnlocked,
} from "~~/components/pulse/setup/setupStages";
import { SHOW_SCAFFOLD_DEV_UI } from "~~/constants/pulseAppConfig";
import { usePulseStore } from "~~/services/store/pulseStore";
import { notification } from "~~/utils/scaffold-eth/notification";

export const SetupWizard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const store = usePulseStore();
  const { deviceVerified, configSaved, config, mockSaveConfig, mockCompleteSetup } = store;

  const progress = useMemo(
    () =>
      getSetupStageProgress({
        deviceVerified: store.deviceVerified,
        configSaved: store.configSaved,
        adapters: store.adapters,
        requestors: store.requestors,
        enabledModuleIds: store.enabledModuleIds,
      }),
    [store.deviceVerified, store.configSaved, store.adapters, store.requestors, store.enabledModuleIds],
  );

  const [currentStage, setCurrentStage] = useState<SetupStageId>(() => getDefaultSetupStage(progress));
  const [googleRefreshToken, setGoogleRefreshToken] = useState(0);

  useEffect(() => {
    setCurrentStage(previous => {
      if (isStageUnlocked(previous, progress)) return previous;
      return getDefaultSetupStage(progress);
    });
  }, [progress]);

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

  const handleBack = () => {
    const previous = getPreviousStage(currentStage);
    if (previous) setCurrentStage(previous);
  };

  const handleNext = () => {
    if (currentStage === "signals" && !validateEnabledModulesForActivation()) return;
    const next = getNextStage(currentStage);
    if (next) setCurrentStage(next);
  };

  const handleFinish = () => {
    if (!configSaved) return;
    if (!validateEnabledModulesForActivation()) return;
    mockCompleteSetup();
    router.push("/console");
  };

  // Clearance for fixed WizardFooter (+ DevFloatingBar when dev UI is on).
  const scrollClearance = SHOW_SCAFFOLD_DEV_UI
    ? "pb-[28rem] sm:pb-[32rem]"
    : "pb-[20rem] sm:pb-[24rem]";

  return (
    <>
      <PageShell className={scrollClearance}>
        <SectionHeader
          title="profile setup"
          eyebrow="pulse explorer"
          subtitle="Signals, identity, and rhythm — one stage at a time."
        />

        {currentStage === "signals" ? <StageSignals googleRefreshToken={googleRefreshToken} /> : null}
        {currentStage === "identity" ? <StageIdentity /> : null}
        {currentStage === "rhythm" ? (
          <StageRhythm
            disabled={!deviceVerified}
            initialConfig={config}
            onSave={savedConfig => mockSaveConfig(savedConfig)}
          />
        ) : null}

        <div
          aria-hidden
          className={SHOW_SCAFFOLD_DEV_UI ? "h-40 sm:h-48" : "h-32 sm:h-40"}
        />
      </PageShell>

      <WizardFooter
        currentStage={currentStage}
        progress={progress}
        onSelectStage={stageId => {
          if (isStageUnlocked(stageId, progress)) setCurrentStage(stageId);
        }}
        onBack={handleBack}
        onNext={handleNext}
        onFinish={handleFinish}
        finishDisabled={!configSaved}
      />
    </>
  );
};
