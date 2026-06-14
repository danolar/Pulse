"use client";

import { useEffect, useMemo, useState } from "react";
import { isAddress } from "viem";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { PageShell, SectionHeader } from "~~/components/pulse";
import { ProfileTargetInput } from "~~/components/pulse/setup/ProfileTargetInput";
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
import { usePulseStore } from "~~/services/store/pulseStore";

type SetupWizardProps = {
  editProfileId?: string;
};

export const SetupWizard = ({ editProfileId }: SetupWizardProps) => {
  const router = useRouter();
  const { address } = useAccount();
  const store = usePulseStore();
  const {
    deviceVerified,
    configSaved,
    config,
    notificationTarget,
    ownerAddress,
    profileId,
    mockSaveConfig,
    mockCompleteSetup,
    initProfileTarget,
  } = store;

  const [ownerDraft, setOwnerDraft] = useState(() => ownerAddress ?? address ?? "");

  useEffect(() => {
    if (!address) return;
    if (ownerAddress && isAddress(ownerAddress)) {
      setOwnerDraft(ownerAddress);
      return;
    }
    if (editProfileId) return;
    setOwnerDraft(address);
  }, [address, ownerAddress, editProfileId]);

  useEffect(() => {
    if (!address || !isAddress(ownerDraft)) return;
    initProfileTarget(ownerDraft, address);
  }, [address, ownerDraft, initProfileTarget]);

  const progress = useMemo(
    () =>
      getSetupStageProgress({
        deviceVerified: store.deviceVerified,
        configSaved: store.configSaved,
        adapters: store.adapters,
      }),
    [store.deviceVerified, store.configSaved, store.adapters],
  );

  const [currentStage, setCurrentStage] = useState<SetupStageId>(() => getDefaultSetupStage(progress));

  useEffect(() => {
    setCurrentStage(previous => {
      if (isStageUnlocked(previous, progress)) return previous;
      return getDefaultSetupStage(progress);
    });
  }, [progress]);

  const ownerValid = isAddress(ownerDraft);

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
    if (!configSaved || !ownerValid || !address) return;
    if (!validateEnabledModulesForActivation()) return;
    mockCompleteSetup();
    const targetProfileId = profileId ?? initProfileTarget(ownerDraft, address);
    router.push(`/dashboard/${targetProfileId}`);
  };

  const scrollClearance = SHOW_SCAFFOLD_DEV_UI
    ? "pb-[28rem] sm:pb-[32rem]"
    : "pb-[20rem] sm:pb-[24rem]";

  return (
    <>
      <PageShell className={scrollClearance}>
        <SectionHeader
          title={CONFIGURATION_PAGE_TITLE}
          eyebrow="setup"
          subtitle={CONFIGURATION_PAGE_SUBTITLE}
        />

        <div className="mb-6">
          <ProfileTargetInput
            ownerAddress={ownerDraft}
            onOwnerAddressChange={setOwnerDraft}
            disabled={Boolean(editProfileId)}
          />
        </div>

        {currentStage === "signals" ? <StageSignals /> : null}
        {currentStage === "identity" ? <StageIdentity ownerAddress={ownerDraft} /> : null}
        {currentStage === "rhythm" ? (
          <StageRhythm
            disabled={!deviceVerified}
            initialConfig={config}
            initialNotificationTarget={notificationTarget}
            onSave={(savedConfig, target) => mockSaveConfig(savedConfig, target)}
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
        finishDisabled={!configSaved || !ownerValid}
      />
    </>
  );
};
