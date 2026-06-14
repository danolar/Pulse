import "dotenv/config";
import { Wallet } from "ethers";
import password from "@inquirer/password";
import { spawn } from "child_process";

/**
 * Decrypts DEPLOYER_PRIVATE_KEY_ENCRYPTED and runs `tsx <script> ...` with __RUNTIME_DEPLOYER_PRIVATE_KEY set.
 */
async function main() {
  const scriptPath = process.argv[2];
  if (!scriptPath) {
    console.error("Usage: tsx scripts/runWithDeployerPK.ts <script.ts> [--network sepolia] ...");
    process.exit(1);
  }

  const scriptArgs = process.argv.slice(3);
  const networkIndex = scriptArgs.indexOf("--network");
  const networkName = networkIndex !== -1 ? scriptArgs[networkIndex + 1] : "default";
  const isLocalNetwork = networkName === "default" || networkName === "hardhat";

  if (!isLocalNetwork) {
    const encryptedKey = process.env.DEPLOYER_PRIVATE_KEY_ENCRYPTED;
    if (!encryptedKey) {
      console.error("Missing DEPLOYER_PRIVATE_KEY_ENCRYPTED — run yarn account:import first.");
      process.exit(1);
    }

    const pass = await password({ message: "Enter password to decrypt deployer private key:" });
    try {
      const wallet = await Wallet.fromEncryptedJson(encryptedKey, pass);
      process.env.__RUNTIME_DEPLOYER_PRIVATE_KEY = wallet.privateKey;
    } catch {
      console.error("Failed to decrypt private key. Wrong password?");
      process.exit(1);
    }
  }

  const child = spawn("tsx", [scriptPath, ...scriptArgs], {
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  });

  child.on("exit", code => process.exit(code ?? 0));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
