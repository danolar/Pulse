import { getHackathonCreAdapterWallet } from "./creHackathonAdapter.js";

async function main() {
  const wallet = getHackathonCreAdapterWallet();
  console.log("Hackathon CRE adapter (Hardhat #3) — Sepolia testnet ONLY");
  console.log("Address:", wallet.address);
  console.log("Private key:", wallet.privateKey);
  console.log("");
  console.log("Do not commit this output. Do not fund on mainnet.");
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
