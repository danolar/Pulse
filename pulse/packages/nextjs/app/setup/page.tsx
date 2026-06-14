"use client";

import { RouteGuard } from "~~/components/pulse/layout/RouteGuard";
import { SetupWizard } from "~~/components/pulse/setup/SetupWizard";

export default function SetupPage() {
  return (
    <RouteGuard>
      <SetupWizard />
    </RouteGuard>
  );
}
