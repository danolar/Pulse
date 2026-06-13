"use client";

import { ActiveAdapterList } from "~~/components/pulse/setup/signals/ActiveAdapterList";
import { TrustedRequestorsSection } from "~~/components/pulse/setup/signals/SignalAdaptersSection";

export const StageSignals = () => (
  <div className="space-y-6">
    <ActiveAdapterList />
    <TrustedRequestorsSection />
  </div>
);
