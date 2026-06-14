import "dotenv/config";
import { Contract, JsonRpcProvider, formatEther, getAddress } from "ethers";

const SEPOLIA_ORACLE = "0x41e60b7c2f067a3bb5a655959c944f7f28bd66e3";
const PROFILE_OWNER = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const PROFILE_CONSUMER = "0x4D7a23045f7C76Dc57e2aFd2eb038e2Cf743e284";

const pulseOracleAbi = [
  "function computeProfileId(address owner, address consumer) view returns (bytes32)",
  "function adapters(bytes32 profileId, address adapter) view returns (bool authorized, uint32 weight, uint8 capabilities, bytes32 typeLabel)",
] as const;

async function main() {
  const addressRaw = process.env.CRE_ADAPTER_ADDRESS?.trim();
  if (!addressRaw) {
    console.log("No CRE_ADAPTER_ADDRESS in packages/hardhat/.env — run yarn cre:adapter:generate first.");
    process.exit(1);
  }

  const adapterAddress = getAddress(addressRaw);
  const rpc =
    process.env.SEPOLIA_RPC_URL ??
    `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY ?? "IZYEU2cWBgnFmgiTAgpWD"}`;
  const provider = new JsonRpcProvider(rpc);

  const oracle = new Contract(SEPOLIA_ORACLE, pulseOracleAbi, provider);
  const profileId = await oracle.computeProfileId(PROFILE_OWNER, PROFILE_CONSUMER);
  const adapterAuth = await oracle.adapters(profileId, adapterAddress);

  const code = await provider.getCode(adapterAddress);
  const isDelegated = code !== "0x" && code.startsWith("0xef0100");

  console.log("Pulse CRE adapter (private generated wallet)");
  console.log("Address:", adapterAddress);
  console.log("Sepolia balance:", formatEther(await provider.getBalance(adapterAddress)), "ETH");
  console.log("Account type:", isDelegated ? "⚠️ EIP-7702 delegated (do not use)" : "EOA (OK)");
  console.log("Authorized on PulseOracleV2:", adapterAuth.authorized);
  if (adapterAuth.authorized) {
    console.log("Adapter weight:", adapterAuth.weight.toString());
  }
  console.log("");
  console.log("Fund: yarn cre:adapter:fund --network sepolia");
  console.log("Authorize: yarn cre:adapter:authorize --network sepolia");
  console.log("Broadcast: yarn cre:report -- --force");
  console.log("");
  console.log("Password note: fund/authorize use DEPLOYER password; cre:report uses CRE adapter password from generate.");
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
