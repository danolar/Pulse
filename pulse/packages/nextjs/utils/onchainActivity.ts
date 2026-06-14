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
  const hasNoOnchainActivity = lastActivityTimestamp === null;
  const inactiveSeconds = hasNoOnchainActivity
    ? profile.inactivityThresholdSeconds + 1
    : Math.max(0, nowSeconds - lastActivityTimestamp);

  const shouldReportInactive = inactiveSeconds >= profile.inactivityThresholdSeconds;

  return {
    profileAddress: profile.address,
    lastActivityTimestamp,
    inactiveSeconds,
    shouldReportInactive,
    weight: shouldReportInactive ? profile.inactiveSignalWeight : 0,
    walrusBlobRef: shouldReportInactive
      ? `walrus://pulse/evidence/onchain-inactivity/${profile.address.toLowerCase()}`
      : "",
    reason: shouldReportInactive
      ? hasNoOnchainActivity
        ? `No outgoing txs in recent blocks (threshold ${profile.inactivityThresholdSeconds}s)`
        : `Inactive for ${Math.floor(inactiveSeconds)}s (threshold ${profile.inactivityThresholdSeconds}s)`
      : `Active within threshold (${Math.floor(inactiveSeconds)}s)`,
  };
};

export const ONCHAIN_TX_SIGNAL_TYPE = "ONCHAIN_TX";
