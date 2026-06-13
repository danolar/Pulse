import { useAccount } from "wagmi";
import { SHOW_SCAFFOLD_DEV_UI } from "~~/constants/pulseAppConfig";
import { usePulseStore } from "~~/services/store/pulseStore";
import type { ActingRole } from "~~/types/pulse";

const isEthAddress = (value: string): boolean => /^0x[a-fA-F0-9]{40}$/.test(value);

/**
 * Dev builds: manual header switcher (store.actingAs).
 * Production: infer from connected wallet vs profile owner / authorized requestors.
 */
export const useResolvedActingRole = (): ActingRole => {
  const { address } = useAccount();
  const { actingAs, profileId, requestors } = usePulseStore();

  if (SHOW_SCAFFOLD_DEV_UI) return actingAs;

  if (!address) return "owner";

  const normalizedAddress = address.toLowerCase();
  const isAuthorizedRequestor = requestors.some(
    requestor => requestor.address.toLowerCase() === normalizedAddress,
  );
  const isProfileOwner =
    Boolean(profileId && isEthAddress(profileId) && profileId.toLowerCase() === normalizedAddress);

  if (isAuthorizedRequestor && !isProfileOwner) return "requestor";
  return "owner";
};
