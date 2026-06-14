import { type Address, encodePacked, keccak256 } from "viem";
import { normalizeAddress } from "~~/utils/pulse/explorerAddress";

export type ProfileId = `0x${string}`;

/** profileId = keccak256(ownerAddress, consumerAddress) — spec §8.1 */
export const computeProfileId = (owner: Address, consumer: Address): ProfileId =>
  keccak256(encodePacked(["address", "address"], [owner, consumer]));

export const computeConsumerContextHash = (consumer: Address): `0x${string}` =>
  keccak256(encodePacked(["address"], [consumer]));

export const truncateHash = (hash: string, chars = 8): string => {
  if (!hash.startsWith("0x") || hash.length < 2 + chars) return hash;
  return `${hash.slice(0, 2 + chars)}…`;
};

export const resolveProfileIdentity = (
  ownerAddress: string,
  consumerAddress: string,
): { ownerAddress: Address; consumerAddress: Address; profileId: ProfileId } => {
  const owner = normalizeAddress(ownerAddress) as Address;
  const consumer = normalizeAddress(consumerAddress) as Address;
  return { ownerAddress: owner, consumerAddress: consumer, profileId: computeProfileId(owner, consumer) };
};
