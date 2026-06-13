"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { useReducedMotion } from "~~/hooks/useReducedMotion";
import type { ConsoleSignal } from "~~/types/pulse";

type ConsoleSignalTimelineProps = {
  signals: ConsoleSignal[];
};

const formatTimestamp = (iso: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));

export const ConsoleSignalTimeline = ({ signals }: ConsoleSignalTimelineProps) => {
  const reducedMotion = useReducedMotion();

  return (
    <section className="pulse-card p-5 sm:p-6">
      <h2 className="mb-4 text-base font-semibold text-base-content">Signal timeline</h2>

      <ol className="space-y-3">
        {signals.map((signal, index) => (
          <motion.li
            key={signal.id}
            className="rounded-2xl border border-base-content/10 bg-base-200/60 p-4"
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.22, delay: reducedMotion ? 0 : index * 0.04 }}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium text-base-content">{signal.signalType}</p>
                <p className="text-xs text-pulse-muted">
                  {signal.direction === "positive" ? "Positive" : "Negative"} · Weight {signal.weight > 0 ? "+" : ""}
                  {signal.weight}
                </p>
              </div>
              <span className="font-mono text-xs text-pulse-muted">{formatTimestamp(signal.timestamp)}</span>
            </div>
            <a
              href="#"
              className="mt-3 inline-flex items-center gap-1 text-sm link"
              onClick={event => {
                event.preventDefault();
                // TODO: fetch Walrus blob by blobId
                window.alert(`TODO: fetch Walrus blob ${signal.walrusBlobId}`);
              }}
            >
              View
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </motion.li>
        ))}
      </ol>
    </section>
  );
};
