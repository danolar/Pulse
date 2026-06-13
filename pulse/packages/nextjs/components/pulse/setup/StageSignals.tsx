"use client";

import { ActiveAdapterList } from "~~/components/pulse/setup/signals/ActiveAdapterList";
import { RequestorsConfigStatus } from "~~/components/pulse/setup/signals/RequestorsConfigStatus";

export const StageSignals = () => (
  <div className="space-y-6">
    <ActiveAdapterList />
    <RequestorsConfigStatus />
  </div>
);
