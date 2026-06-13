"use client";

import { FooterContent } from "~~/components/Footer";
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
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

type WizardNavArrowProps = {
  direction: "back" | "forward";
  disabled?: boolean;
  label: string;
  onClick: () => void;
  finish?: boolean;
};

const WizardNavArrow = ({ direction, disabled, label, onClick, finish }: WizardNavArrowProps) => {
  const Icon = direction === "back" ? ChevronLeft : finish ? ArrowRight : ChevronRight;

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`group flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
        disabled
          ? "cursor-not-allowed border-base-content/8 bg-base-200/40 text-base-content/25"
          : finish
            ? "border-primary/30 bg-primary/10 text-primary hover:border-primary/50 hover:bg-primary/15 hover:shadow-pulse-sm"
            : "border-base-content/10 bg-base-100/80 text-base-content/70 hover:border-primary/25 hover:bg-primary/5 hover:text-primary"
      }`}
    >
      <Icon
        className={`h-5 w-5 transition-transform duration-200 ${
          disabled ? "" : "group-hover:scale-110"
        } ${direction === "back" && !disabled ? "group-hover:-translate-x-0.5" : ""} ${
          direction === "forward" && !disabled ? "group-hover:translate-x-0.5" : ""
        }`}
        strokeWidth={2}
      />
    </button>
  );
};

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
  const forwardDisabled = isLastStage ? (finishDisabled ?? !canAdvance) : !canAdvance || !nextStage;

  const bottomOffset = SHOW_SCAFFOLD_DEV_UI ? "bottom-16 sm:bottom-[4.5rem]" : "bottom-0";

  return (
    <footer
      className={`fixed inset-x-0 z-30 border-t border-base-content/6 bg-base-100/90 pb-[max(0.625rem,env(safe-area-inset-bottom))] backdrop-blur-md ${bottomOffset}`}
      aria-label="Configuration navigation"
    >
      <div className="pulse-page-x mx-auto max-w-3xl space-y-2 px-4 pt-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <WizardNavArrow
            direction="back"
            label="Previous stage"
            disabled={!previousStage}
            onClick={onBack}
          />

          <div className="min-w-0 flex-1">
            <StageRail currentStage={currentStage} progress={progress} onSelectStage={onSelectStage} />
          </div>

          <WizardNavArrow
            direction="forward"
            label={isLastStage ? "View profile" : "Next stage"}
            disabled={forwardDisabled}
            finish={isLastStage}
            onClick={isLastStage ? onFinish : onNext}
          />
        </div>

        {stageMeta ? (
          <p className="m-0 mb-3 text-center text-xs text-pulse-muted">{stageMeta.detail}</p>
        ) : null}

        <div className="border-t border-base-content/5 pt-3">
          <FooterContent compact />
        </div>
      </div>
    </footer>
  );
};
