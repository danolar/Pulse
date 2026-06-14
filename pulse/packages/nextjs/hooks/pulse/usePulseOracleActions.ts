"use client";

import type { IDKitResult } from "@worldcoin/idkit";
import { useCallback } from "react";
import { getAddress, keccak256, encodePacked, type Hex } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth/notification";
import { extractCheckinProofArgs } from "~~/utils/worldIdOnchainProof";

export const isPulseOnchainEnabled = (): boolean =>
  Boolean(process.env.NEXT_PUBLIC_PULSE_ORACLE_ADDRESS?.trim());

export const computeOnchainProfileId = (ownerAddress: string, consumerAddress: string): Hex =>
  keccak256(
    encodePacked(["address", "address"], [getAddress(ownerAddress), getAddress(consumerAddress)]),
  );

export const usePulseOracleActions = () => {
  const { address } = useAccount();
  const { writeContractAsync, isMining } = useScaffoldWriteContract({ contractName: "PulseOracleV2" });

  const checkinOnchain = useCallback(
    async (params: { ownerAddress: string; consumerAddress: string; idkitResult: IDKitResult }) => {
      if (!address) {
        throw new Error("Connect the profile owner wallet on Sepolia.");
      }

      const owner = getAddress(params.ownerAddress);
      if (getAddress(address) !== owner) {
        throw new Error("Connected wallet must match the profile owner for onchain checkin.");
      }

      const proofArgs = extractCheckinProofArgs(params.idkitResult, owner);
      const profileId = computeOnchainProfileId(owner, params.consumerAddress);

      const txHash = await writeContractAsync({
        functionName: "checkin",
        args: [
          profileId,
          proofArgs.root,
          proofArgs.nullifierHash,
          proofArgs.externalNullifierHash,
          proofArgs.signalHash,
          [...proofArgs.proof],
        ],
      });

      notification.success("Check-in recorded on Sepolia");
      return { txHash, profileId };
    },
    [address, writeContractAsync],
  );

  return {
    checkinOnchain,
    isCheckinPending: isMining,
    onchainEnabled: isPulseOnchainEnabled(),
  };
};
