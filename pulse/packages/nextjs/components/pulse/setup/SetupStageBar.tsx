"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { SHOW_SCAFFOLD_DEV_UI } from "~~/constants/pulseAppConfig";

const SETUP_STAGES = [
  { id: "setup-stage-package", label: "Package", detail: "Signals & connections" },
  { id: "setup-stage-identity", label: "Identity", detail: "World ID Device + Orb" },
  { id: "setup-stage-rhythm", label: "Rhythm", detail: "When Pulse checks on you" },
] as const;

export const SetupStageBar = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const sections = SETUP_STAGES.map(stage => document.getElementById(stage.id)).filter(
      (element): element is HTMLElement => Boolean(element),
    );
    if (!sections.length) return;

    const visibility = new Map<string, number>();

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          visibility.set(entry.target.id, entry.intersectionRatio);
        });

        let nextIndex = 0;
        let bestRatio = -1;

        SETUP_STAGES.forEach((stage, index) => {
          const ratio = visibility.get(stage.id) ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            nextIndex = index;
          }
        });

        setActiveIndex(nextIndex);
      },
      { threshold: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1], rootMargin: "-22% 0px -28% 0px" },
    );

    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const bottomOffset = SHOW_SCAFFOLD_DEV_UI ? "bottom-20 sm:bottom-24" : "bottom-4 sm:bottom-6";

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 z-30 flex justify-center px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] ${bottomOffset}`}
      aria-label="Setup progress"
      role="navigation"
    >
      <div className="pointer-events-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-base-content/8 bg-base-100/92 shadow-pulse-md backdrop-blur-md">
        <div className="relative h-1 bg-base-200">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-primary"
            initial={false}
            animate={{ width: `${((activeIndex + 1) / SETUP_STAGES.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          />
        </div>

        <ol className="grid grid-cols-3 gap-0.5 p-2 sm:gap-1 sm:p-3">
          {SETUP_STAGES.map((stage, index) => {
            const isActive = index === activeIndex;
            const isComplete = index < activeIndex;

            return (
              <li key={stage.id} className="min-w-0">
                <motion.div
                  animate={{
                    scale: isActive ? 1.02 : 1,
                    opacity: isActive || isComplete ? 1 : 0.5,
                  }}
                  transition={{ duration: 0.25 }}
                  className={`rounded-xl px-1 py-1.5 text-center sm:px-2 ${isActive ? "bg-primary/8" : ""}`}
                  aria-current={isActive ? "step" : undefined}
                >
                  <p className="pulse-label m-0 text-[9px] sm:text-[10px]">Stage {index + 1}</p>
                  <div className="flex items-center justify-center gap-1">
                    {isComplete ? (
                      <Check className="h-3 w-3 shrink-0 text-success" aria-hidden />
                    ) : isActive ? (
                      <motion.span
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                        animate={{ scale: [1, 1.4, 1], opacity: [1, 0.65, 1] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                        aria-hidden
                      />
                    ) : null}
                    <p className="pulse-item-title m-0 truncate text-xs sm:text-sm">{stage.label}</p>
                  </div>
                  <p className="m-0 hidden truncate text-[10px] text-pulse-muted sm:block">{stage.detail}</p>
                </motion.div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};
