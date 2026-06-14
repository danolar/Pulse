"use client";

import { ProfileConsole } from "~~/components/pulse/dashboard/ProfileConsole";
import { RouteGuard } from "~~/components/pulse/layout/RouteGuard";

export default function ProfileConsolePage() {
  return (
    <RouteGuard>
      <ProfileConsole />
    </RouteGuard>
  );
}
