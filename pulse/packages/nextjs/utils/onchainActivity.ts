export type ProfileActivityTarget = {
  address: string;
  inactivityThresholdSeconds: number;
  inactiveSignalWeight: number;
};

export type ActivityEvaluation = {
  profileAddress: string;
  lastActivityTimestamp: number | null;
  inactiveSeconds: number;
  shouldReportInactive: boolean;
  weight: number;
  walrusBlobRef: string;
  reason: string;
};

export const evaluateOnchainInactivity = (
  profile: ProfileActivityTarget,
  lastActivityTimestamp: number | null,
  nowSeconds: number,
): ActivityEvaluation => {
  const inactiveSeconds =
    lastActivityTimestamp === null ? Number.POSITIVE_INFINITY : Math.max(0, nowSeconds - lastActivityTimestamp);

  const shouldReportInactive = inactiveSeconds >= profile.inactivityThresholdSeconds;

  return {
    profileAddress: profile.address,
    lastActivityTimestamp,
    inactiveSeconds: Number.isFinite(inactiveSeconds) ? inactiveSeconds : profile.inactivityThresholdSeconds + 1,
    shouldReportInactive,
    weight: shouldReportInactive ? profile.inactiveSignalWeight : 0,
    walrusBlobRef: shouldReportInactive
      ? `walrus://pulse/evidence/onchain-inactivity/${profile.address.toLowerCase()}`
      : "",
    reason: shouldReportInactive
      ? `Inactive for ${Math.floor(inactiveSeconds)}s (threshold ${profile.inactivityThresholdSeconds}s)`
      : `Active within threshold (${Math.floor(inactiveSeconds)}s)`,
  };
};

export const ONCHAIN_TX_SIGNAL_TYPE = "ONCHAIN_TX";
