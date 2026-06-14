"use client";

import { DevDashboard } from "~~/components/pulse/dashboard/DevDashboard";
import { RouteGuard } from "~~/components/pulse/layout/RouteGuard";

export default function DashboardPage() {
  return (
    <RouteGuard>
      <DevDashboard />
    </RouteGuard>
  );
}
