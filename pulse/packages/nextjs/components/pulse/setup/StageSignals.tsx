"use client";

import { SignalAdaptersSection, TrustedRequestorsSection } from "~~/components/pulse/setup/signals/SignalAdaptersSection";

export const StageSignals = () => (
  <div className="space-y-6">
    <SignalAdaptersSection />
    <TrustedRequestorsSection />
  </div>
);
