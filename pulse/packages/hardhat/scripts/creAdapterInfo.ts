import "dotenv/config";
import { Contract, JsonRpcProvider, formatEther } from "ethers";
import { getHackathonCreAdapterWallet, HACKATHON_CRE_ADAPTER_ADDRESS } from "./creHackathonAdapter.js";

const SEPOLIA_ORACLE = "0x41e60b7c2f067a3bb5a655959c944f7f28bd66e3";
const PROFILE_OWNER = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const PROFILE_CONSUMER = "0x4D7a23045f7C76Dc57e2aFd2eb038e2Cf743e284";

const pulseOracleAbi = [
  "function computeProfileId(address owner, address consumer) view returns (bytes32)",
  "function adapters(bytes32 profileId, address adapter) view returns (bool authorized, uint32 weight, uint8 capabilities, bytes32 typeLabel)",
] as const;

async function main() {
  const wallet = getHackathonCreAdapterWallet();
  const rpc =
    process.env.SEPOLIA_RPC_URL ??
    `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY ?? "IZYEU2cWBgnFmgiTAgpWD"}`;
  const provider = new JsonRpcProvider(rpc);

  const balance = await provider.getBalance(wallet.address);
  const oracle = new Contract(SEPOLIA_ORACLE, pulseOracleAbi, provider);
  const profileId = await oracle.computeProfileId(PROFILE_OWNER, PROFILE_CONSUMER);
  const adapterAuth = await oracle.adapters(profileId, wallet.address);

  console.log("Pulse hackathon CRE adapter (Hardhat mnemonic account #3)");
  console.log("Address:", wallet.address);
  console.log("Expected:", HACKATHON_CRE_ADAPTER_ADDRESS);
  console.log("Sepolia balance:", formatEther(balance), "ETH");
  console.log("Authorized on PulseOracleV2:", adapterAuth.authorized);
  if (adapterAuth.authorized) {
    console.log("Adapter weight:", adapterAuth.weight.toString());
  }
  console.log("");
  console.log("Fund this address on Sepolia (~0.05 ETH is enough for many reportSignal txs).");
  console.log("Authorize (once, uses your deployer wallet): yarn cre:adapter:authorize --network sepolia");
  console.log("Broadcast signal: yarn cre:report -- --force");
  console.log("");
  console.log("Private key: derived locally from the public Hardhat test mnemonic — never use on mainnet.");
  console.log("Show locally only: yarn cre:adapter:reveal-key");
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
