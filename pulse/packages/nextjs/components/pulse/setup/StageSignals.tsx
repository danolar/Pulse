"use client";

import { ActiveAdapterList } from "~~/components/pulse/setup/signals/ActiveAdapterList";
import { AddFromConfiguredButton } from "~~/components/pulse/setup/signals/AddFromConfiguredButton";
import { TrustedRequestorsSection } from "~~/components/pulse/setup/signals/TrustedRequestorsSection";

export const StageSignals = () => (
  <div className="space-y-6">
    <ActiveAdapterList />
    <AddFromConfiguredButton />
    <TrustedRequestorsSection />
  </div>
);
