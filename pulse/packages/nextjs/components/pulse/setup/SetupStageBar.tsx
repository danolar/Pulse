"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FooterContent } from "~~/components/Footer";
import { SHOW_SCAFFOLD_DEV_UI } from "~~/constants/pulseAppConfig";

const SETUP_STAGES = [
  { id: "setup-stage-package", label: "Package", detail: "Signals & connections" },
  { id: "setup-stage-identity", label: "Identity", detail: "World ID Device + Orb" },
  { id: "setup-stage-rhythm", label: "Rhythm", detail: "When Pulse checks on you" },
] as const;

const StagePulseIndicator = () => (
  <span className="relative flex h-5 w-5 shrink-0 items-center justify-center" aria-hidden>
    <motion.span
      className="absolute inset-0 rounded-full border border-primary/40"
      animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
    />
    <motion.span
      className="absolute inset-0 rounded-full border border-primary/25"
      animate={{ scale: [1, 1.7], opacity: [0.35, 0] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: 0.35 }}
    />
    <span className="relative h-2 w-2 rounded-full bg-primary" />
  </span>
);

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

  const bottomOffset = SHOW_SCAFFOLD_DEV_UI ? "bottom-16 sm:bottom-[4.5rem]" : "bottom-0";
  const activeStage = SETUP_STAGES[activeIndex];

  return (
    <nav
      className={`fixed inset-x-0 z-30 border-t border-base-content/6 bg-base-100/80 pb-[max(0.625rem,env(safe-area-inset-bottom))] backdrop-blur-md ${bottomOffset}`}
      aria-label="Setup progress"
    >
      <div className="pulse-page-x mx-auto max-w-3xl px-4 pt-3">
        <ol className="flex items-center justify-center gap-6 sm:gap-10">
          {SETUP_STAGES.map((stage, index) => {
            const isActive = index === activeIndex;

            return (
              <li key={stage.id}>
                <motion.span
                  animate={{ opacity: isActive ? 1 : 0.3 }}
                  transition={{ duration: 0.25 }}
                  className={`flex items-center text-sm font-medium tracking-wide sm:text-[0.9375rem] ${
                    isActive ? "gap-3 text-base-content" : "text-base-content/70"
                  }`}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isActive ? <StagePulseIndicator /> : null}
                  {stage.label}
                </motion.span>
              </li>
            );
          })}
        </ol>

        <motion.p
          key={activeStage.id}
          initial={{ opacity: 0, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="m-0 pt-2 text-center text-xs text-pulse-muted"
        >
          {activeStage.detail}
        </motion.p>

        <div className="mt-3 border-t border-base-content/5 pt-3">
          <FooterContent compact />
        </div>
      </div>
    </nav>
  );
};
