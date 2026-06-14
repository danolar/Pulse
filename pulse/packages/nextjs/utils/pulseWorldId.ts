import { getAddress, keccak256, stringToBytes } from "viem";

/** Semaphore-compatible field hash — matches PulseWorldId.sol */
export const hashToField = (value: string): bigint => {
  const hash = keccak256(stringToBytes(value));
  return BigInt(hash) >> 8n;
};

export const normalizeOwnerProfileKey = (ownerAddress: string): string => getAddress(ownerAddress).toLowerCase();

/** Matches `worldIdActions.checkin(profileKey)` and PulseOracleV2.getCheckinWorldIdParams. */
export const getCheckinWorldIdParams = (ownerAddress: string) => {
  const profileKey = normalizeOwnerProfileKey(ownerAddress);
  return {
    profileKey,
    action: `checkin-${profileKey}`,
    signalHash: hashToField(profileKey),
    externalNullifierHash: hashToField(`checkin-${profileKey}`),
  };
};
