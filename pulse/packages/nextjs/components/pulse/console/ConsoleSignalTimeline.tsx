"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { WalrusEvidenceModal } from "~~/components/pulse/walrus/WalrusEvidenceModal";
import { formatSignalWeight } from "~~/constants/pulseProtocol";
import { useReducedMotion } from "~~/hooks/useReducedMotion";
import type { ConsoleSignal } from "~~/types/pulse";
import { parseWalrusBlobId } from "~~/utils/walrus";

type ConsoleSignalTimelineProps = {
  signals: ConsoleSignal[];
  title?: string;
  subtitle?: string;
  summary?: ReactNode;
  onViewEvidence?: (blobId: string) => void;
};

const formatTimestamp = (iso: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));

export const ConsoleSignalTimeline = ({
  signals,
  title = "Signal audit trail",
  subtitle = "Each signal references Walrus evidence (Seal-encrypted in production). Only current-epoch window signals count.",
  summary,
  onViewEvidence,
}: ConsoleSignalTimelineProps) => {
  const reducedMotion = useReducedMotion();
  const [selectedSignal, setSelectedSignal] = useState<ConsoleSignal | null>(null);

  const openEvidence = (signal: ConsoleSignal) => {
    if (onViewEvidence && parseWalrusBlobId(signal.walrusBlobId)) {
      onViewEvidence(signal.walrusBlobId);
      return;
    }
    setSelectedSignal(signal);
  };

  return (
    <>
      <section className="pulse-card p-5 sm:p-6">
        <h2 className="pulse-section-title mb-1">{title}</h2>
        <p className="mb-4 text-sm leading-relaxed text-pulse-muted">{subtitle}</p>
        {summary}

        <ol className="space-y-3">
          {signals.map((signal, index) => {
            const hasBlob = Boolean(parseWalrusBlobId(signal.walrusBlobId));

            return (
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
                    <p className="text-xs text-pulse-muted">{formatSignalWeight(signal.direction, signal.weight)}</p>
                  </div>
                  <span className="font-mono text-xs text-pulse-muted">{formatTimestamp(signal.timestamp)}</span>
                </div>
                <button
                  type="button"
                  className="mt-3 inline-flex items-center gap-1 text-sm link disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!hasBlob}
                  onClick={() => openEvidence(signal)}
                >
                  View evidence
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
                {!hasBlob ? (
                  <p className="mt-1 text-xs text-pulse-muted">Evidence blob pending (mock ref only)</p>
                ) : null}
              </motion.li>
            );
          })}
        </ol>
      </section>

      {!onViewEvidence ? (
        <WalrusEvidenceModal
          open={selectedSignal !== null}
          blobRef={selectedSignal?.walrusBlobId ?? ""}
          signalType={selectedSignal?.signalType ?? "Signal"}
          onClose={() => setSelectedSignal(null)}
        />
      ) : null}
    </>
  );
};
