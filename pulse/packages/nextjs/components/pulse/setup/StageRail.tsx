"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import {
  SETUP_STAGES,
  type SetupStageId,
  type SetupStageProgress,
  isStageComplete,
  isStageUnlocked,
} from "~~/components/pulse/setup/setupStages";

type StageRailProps = {
  currentStage: SetupStageId;
  progress: SetupStageProgress;
  onSelectStage: (stageId: SetupStageId) => void;
};

const StagePulseIndicator = () => (
  <span className="relative flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden>
    <motion.span
      className="absolute inset-0 rounded-full border border-primary/40"
      animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
    />
    <span className="relative h-1.5 w-1.5 rounded-full bg-primary" />
  </span>
);

export const StageRail = ({ currentStage, progress, onSelectStage }: StageRailProps) => (
  <ol className="flex items-center justify-center gap-2 sm:gap-6" aria-label="Setup stages">
    {SETUP_STAGES.map(stage => {
      const unlocked = isStageUnlocked(stage.id, progress);
      const done = isStageComplete(stage.id, progress);
      const isCurrent = stage.id === currentStage;

      return (
        <li key={stage.id}>
          <button
            type="button"
            disabled={!unlocked}
            onClick={() => unlocked && onSelectStage(stage.id)}
            aria-current={isCurrent ? "step" : undefined}
            className={`flex items-center gap-1.5 rounded-xl px-1.5 py-1 text-xs font-medium transition-colors sm:gap-2 sm:px-2 sm:text-sm ${
              isCurrent
                ? "text-base-content"
                : done
                  ? "text-success/80 hover:text-success"
                  : unlocked
                    ? "text-base-content/70 hover:text-base-content"
                    : "cursor-not-allowed text-base-content/35"
            }`}
          >
            {isCurrent ? <StagePulseIndicator /> : null}
            {!isCurrent && done ? (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success/15 text-success">
                ✓
              </span>
            ) : null}
            {!isCurrent && !done && !unlocked ? <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
            {stage.label}
          </button>
        </li>
      );
    })}
  </ol>
);
