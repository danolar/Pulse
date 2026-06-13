"use client";

import { RouteGuard } from "~~/components/pulse/layout/RouteGuard";
import { AdaptersPage } from "~~/components/pulse/adapters/AdaptersPage";

const Page = () => (
  <RouteGuard>
    <AdaptersPage />
  </RouteGuard>
);

export default Page;
