import type { IDKitResult, ResponseItemV3 } from "@worldcoin/idkit";
import { decodeAbiParameters, hexToBigInt, type Hex } from "viem";
import { getAddress } from "viem";
import { getCheckinWorldIdParams } from "~~/utils/pulseWorldId";

const ORB_CREDENTIALS = new Set(["orb", "proof_of_human"]);

export type CheckinProofArgs = {
  root: bigint;
  nullifierHash: bigint;
  externalNullifierHash: bigint;
  signalHash: bigint;
  proof: readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];
};

const isV3Response = (response: IDKitResult["responses"][number]): response is ResponseItemV3 =>
  "merkle_root" in response && typeof response.merkle_root === "string";

const parseHexBigInt = (value: string, label: string): bigint => {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`World ID proof missing ${label}.`);
  }
  return hexToBigInt(trimmed.startsWith("0x") ? (trimmed as Hex) : (`0x${trimmed}` as Hex));
};

const decodeV3Proof = (proofHex: string): CheckinProofArgs["proof"] => {
  const normalized = proofHex.startsWith("0x") ? (proofHex as Hex) : (`0x${proofHex}` as Hex);
  const decoded = decodeAbiParameters([{ type: "uint256[8]" }], normalized)[0];

  if (!Array.isArray(decoded) || decoded.length !== 8) {
    throw new Error("World ID v3 proof must decode to uint256[8].");
  }

  return decoded as CheckinProofArgs["proof"];
};

/** Extract PulseOracleV2.checkin args from an IDKit uniqueness result (legacy v3 Orb proofs). */
export const extractCheckinProofArgs = (result: IDKitResult, ownerAddress: string): CheckinProofArgs => {
  if ("session_id" in result && result.session_id) {
    throw new Error("Session proofs cannot be used for onchain checkin.");
  }

  if (!("responses" in result) || !Array.isArray(result.responses) || result.responses.length === 0) {
    throw new Error("World ID proof is missing credential responses.");
  }

  const orbResponse = result.responses.find(response => ORB_CREDENTIALS.has(response.identifier.trim().toLowerCase()));
  if (!orbResponse) {
    throw new Error("Onchain checkin requires an Orb proof (proof_of_human).");
  }

  const { signalHash, externalNullifierHash } = getCheckinWorldIdParams(getAddress(ownerAddress));

  if (isV3Response(orbResponse)) {
    return {
      root: parseHexBigInt(orbResponse.merkle_root, "merkle root"),
      nullifierHash: parseHexBigInt(orbResponse.nullifier, "nullifier"),
      externalNullifierHash,
      signalHash,
      proof: decodeV3Proof(orbResponse.proof),
    };
  }

  if (Array.isArray(orbResponse.proof)) {
    throw new Error(
      "World ID v4 proofs use WorldIDVerifier (uint256[5]). PulseOracleV2 expects legacy Orb proofs — enable allow_legacy_proofs and use the Orb credential.",
    );
  }

  throw new Error("Unrecognized World ID proof format for onchain checkin.");
};
