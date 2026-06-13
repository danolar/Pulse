"use client";

import { FooterContent } from "~~/components/Footer";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import { SHOW_SCAFFOLD_DEV_UI } from "~~/constants/pulseAppConfig";
import {
  SETUP_STAGES,
  type SetupStageId,
  type SetupStageProgress,
  getNextStage,
  getPreviousStage,
  isStageComplete,
} from "~~/components/pulse/setup/setupStages";
import { StageRail } from "~~/components/pulse/setup/StageRail";

type WizardFooterProps = {
  currentStage: SetupStageId;
  progress: SetupStageProgress;
  onSelectStage: (stageId: SetupStageId) => void;
  onBack: () => void;
  onNext: () => void;
  onFinish: () => void;
  finishDisabled?: boolean;
};

export const WizardFooter = ({
  currentStage,
  progress,
  onSelectStage,
  onBack,
  onNext,
  onFinish,
  finishDisabled,
}: WizardFooterProps) => {
  const stageMeta = SETUP_STAGES.find(stage => stage.id === currentStage);
  const previousStage = getPreviousStage(currentStage);
  const nextStage = getNextStage(currentStage);
  const isLastStage = currentStage === "rhythm";
  const canAdvance = isStageComplete(currentStage, progress);

  const bottomOffset = SHOW_SCAFFOLD_DEV_UI ? "bottom-16 sm:bottom-[4.5rem]" : "bottom-0";

  return (
    <footer
      className={`fixed inset-x-0 z-30 border-t border-base-content/6 bg-base-100/90 pb-[max(0.625rem,env(safe-area-inset-bottom))] backdrop-blur-md ${bottomOffset}`}
      aria-label="Setup navigation"
    >
      <div className="pulse-page-x mx-auto max-w-3xl space-y-3 px-4 pt-3">
        <StageRail currentStage={currentStage} progress={progress} onSelectStage={onSelectStage} />

        {stageMeta ? (
          <p className="m-0 text-center text-xs text-pulse-muted">{stageMeta.detail}</p>
        ) : null}

        <div className="flex items-center justify-between gap-3 pt-1">
          <PulseButton variant="secondary" disabled={!previousStage} onClick={onBack}>
            Back
          </PulseButton>

          {isLastStage ? (
            <PulseButton disabled={finishDisabled ?? !canAdvance} onClick={onFinish}>
              Go to console
            </PulseButton>
          ) : (
            <PulseButton disabled={!canAdvance || !nextStage} onClick={onNext}>
              Next
            </PulseButton>
          )}
        </div>

        <div className="border-t border-base-content/5 pt-3">
          <FooterContent compact />
        </div>
      </div>
    </footer>
  );
};
