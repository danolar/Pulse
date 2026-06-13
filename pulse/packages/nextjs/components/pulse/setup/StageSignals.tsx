"use client";

import { VerificationPackagePanel } from "~~/components/pulse/modules/VerificationPackagePanel";

type StageSignalsProps = {
  googleRefreshToken: number;
};

export const StageSignals = ({ googleRefreshToken }: StageSignalsProps) => (
  <VerificationPackagePanel googleRefreshToken={googleRefreshToken} />
);
