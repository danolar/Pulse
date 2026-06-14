import "dotenv/config";
import { Contract, JsonRpcProvider, Wallet, encodeBytes32String } from "ethers";
import { getCreAdapterAddress } from "./creAdapterWallet.js";

const SEPOLIA_ORACLE = "0x41e60b7c2f067a3bb5a655959c944f7f28bd66e3";
const PROFILE_OWNER = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const CAP_NEGATIVE = 1;
const ADAPTER_WEIGHT = 10;
const ONCHAIN_TX_LABEL = encodeBytes32String("ONCHAIN_TX");

const pulseOracleAbi = [
  "function computeProfileId(address owner, address consumer) view returns (bytes32)",
  "function adapters(bytes32 profileId, address adapter) view returns (bool authorized, uint32 weight, uint8 capabilities, bytes32 typeLabel)",
  "function authorizeAdapter(bytes32 profileId, address adapter, uint32 weight, uint8 capabilities, bytes32 typeLabel)",
] as const;

async function main() {
  const deployerKey =
    process.env.__RUNTIME_DEPLOYER_PRIVATE_KEY ??
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

  const rpc =
    process.env.SEPOLIA_RPC_URL ??
    `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY ?? "IZYEU2cWBgnFmgiTAgpWD"}`;

  const provider = new JsonRpcProvider(rpc);
  const consumer = new Wallet(deployerKey, provider);
  const creAdapterAddress = await getCreAdapterAddress();

  console.log("PulseOracleV2:", SEPOLIA_ORACLE);
  console.log("Profile consumer (signer):", consumer.address);
  console.log("CRE adapter to authorize:", creAdapterAddress);

  const oracle = new Contract(SEPOLIA_ORACLE, pulseOracleAbi, consumer);
  const profileId = await oracle.computeProfileId(PROFILE_OWNER, consumer.address);
  console.log("ProfileId:", profileId);

  const existing = await oracle.adapters(profileId, creAdapterAddress);
  if (existing.authorized) {
    console.log("CRE adapter already authorized with weight", existing.weight.toString());
    return;
  }

  const tx = await oracle.authorizeAdapter(
    profileId,
    creAdapterAddress,
    ADAPTER_WEIGHT,
    CAP_NEGATIVE,
    ONCHAIN_TX_LABEL,
  );
  console.log("authorizeAdapter tx:", tx.hash);
  await tx.wait();
  console.log("Authorized CRE adapter on Sepolia.");
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
