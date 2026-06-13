"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { useReducedMotion } from "~~/hooks/useReducedMotion";

export type SignalEvent = {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  weight: number;
  tone?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
};

type SignalTimelineProps = {
  events: SignalEvent[];
};

const toneClasses = {
  positive: "border-success bg-success/10 text-success",
  negative: "border-error bg-error/10 text-error",
  neutral: "border-info bg-info/10 text-info",
};

export const SignalTimeline = ({ events }: SignalTimelineProps) => {
  const reducedMotion = useReducedMotion();

  return (
    <div className="pulse-card flex h-full flex-col p-5">
      <h3 className="mb-4 shrink-0 text-base font-semibold text-base-content">Signal history</h3>
      <ol className="relative min-h-0 flex-1 space-y-4 before:absolute before:bottom-2 before:left-5 before:top-2 before:w-px before:bg-base-content/10">
        {events.map((event, index) => {
          const Icon = event.icon;
          const tone = event.tone ?? "neutral";

          return (
            <motion.li
              key={event.id}
              className="relative pl-12"
              initial={reducedMotion ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.25, delay: reducedMotion ? 0 : index * 0.06 }}
            >
              <span
                className={`absolute left-0 top-0 z-10 flex h-10 w-10 items-center justify-center rounded-2xl border ${toneClasses[tone]}`}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 rounded-2xl bg-base-200/70 p-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                  <p className="min-w-0 text-sm font-medium leading-snug text-base-content">{event.title}</p>
                  <span className="shrink-0 font-mono text-xs text-pulse-muted">{event.timestamp}</span>
                </div>
                {event.description ? (
                  <p className="mt-1 text-sm leading-relaxed text-pulse-muted">{event.description}</p>
                ) : null}
                <p className="mt-2 font-mono text-xs text-base-content/80">
                  Weight: {event.weight > 0 ? "+" : ""}
                  {event.weight}
                </p>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
};
