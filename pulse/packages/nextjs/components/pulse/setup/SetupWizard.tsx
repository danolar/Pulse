"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { PageShell, SectionHeader } from "~~/components/pulse";
import { ConsumerAdminNote } from "~~/components/pulse/setup/ConsumerAdminNote";
import { validateEnabledModulesForActivation } from "~~/components/pulse/setup/signals/signalsValidation";
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
import {
  CONFIGURATION_PAGE_SUBTITLE,
  CONFIGURATION_PAGE_TITLE,
} from "~~/constants/explorerCopy";
import { SHOW_SCAFFOLD_DEV_UI } from "~~/constants/pulseAppConfig";
import type { RandomnessAgentConfig } from "~~/types/consumer";
import { usePulseStore } from "~~/services/store/pulseStore";

export const SetupWizard = () => {
  const router = useRouter();
  const { address } = useAccount();
  const store = usePulseStore();
  const {
    identityIntegrated,
    configSaved,
    config,
    notificationTarget,
    randomnessAgent,
    mockSaveRhythmConfig,
    mockCompleteSetup,
  } = store;

  useEffect(() => {
    if (address) {
      usePulseStore.setState({ consumerAddress: address });
    }
  }, [address]);

  const progress = useMemo(
    () =>
      getSetupStageProgress({
        identityIntegrated: store.identityIntegrated,
        configSaved: store.configSaved,
      }),
    [store.identityIntegrated, store.configSaved],
  );

  const [currentStage, setCurrentStage] = useState<SetupStageId>(() => getDefaultSetupStage(progress));

  useEffect(() => {
    setCurrentStage(previous => {
      if (isStageUnlocked(previous, progress)) return previous;
      return getDefaultSetupStage(progress);
    });
  }, [progress]);

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
    if (!configSaved || !address) return;
    if (!validateEnabledModulesForActivation()) return;
    if (!identityIntegrated) return;
    mockCompleteSetup();
    router.push("/dashboard");
  };

  const scrollClearance = SHOW_SCAFFOLD_DEV_UI
    ? "pb-[28rem] sm:pb-[32rem]"
    : "pb-[20rem] sm:pb-[24rem]";

  return (
    <>
      <PageShell className={scrollClearance}>
        <SectionHeader
          title={CONFIGURATION_PAGE_TITLE}
          eyebrow="integration"
          subtitle={CONFIGURATION_PAGE_SUBTITLE}
        />

        <div className="mb-6 space-y-4">
          <ConsumerAdminNote />
        </div>

        {currentStage === "signals" ? <StageSignals /> : null}
        {currentStage === "identity" ? <StageIdentity /> : null}
        {currentStage === "rhythm" ? (
          <StageRhythm
            disabled={!identityIntegrated}
            initialConfig={config}
            initialNotificationTarget={notificationTarget}
            initialRandomnessAgent={randomnessAgent}
            onSave={(savedConfig, target, agent) => mockSaveRhythmConfig(savedConfig, target, agent)}
          />
        ) : null}

        <div aria-hidden className={SHOW_SCAFFOLD_DEV_UI ? "h-40 sm:h-48" : "h-32 sm:h-40"} />
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
        finishDisabled={!configSaved || !identityIntegrated}
      />
    </>
  );
};
