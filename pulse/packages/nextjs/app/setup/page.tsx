"use client";

import { RouteGuard } from "~~/components/pulse/layout/RouteGuard";
import { SetupWizard } from "~~/components/pulse/setup/SetupWizard";

const SetupPage = () => (
  <RouteGuard>
    <SetupWizard />
  </RouteGuard>
);

export default SetupPage;
