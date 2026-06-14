import "dotenv/config";
import { Wallet } from "ethers";
import password from "@inquirer/password";
import { spawn } from "child_process";
import { readCreKeystoreJson } from "./keystoreFiles.js";

/**
 * Decrypts CRE_ADAPTER_PRIVATE_KEY_ENCRYPTED and runs `tsx <script> ...`.
 */
async function main() {
  const scriptPath = process.argv[2];
  if (!scriptPath) {
    console.error("Usage: tsx scripts/runWithCreAdapterPK.ts <script.ts> [args...]");
    process.exit(1);
  }

  const scriptArgs = process.argv.slice(3);

  if (process.env.CRE_ADAPTER_PRIVATE_KEY?.trim()) {
    process.env.__RUNTIME_CRE_ADAPTER_PRIVATE_KEY = process.env.CRE_ADAPTER_PRIVATE_KEY.trim();
  } else {
    const encryptedKey = readCreKeystoreJson();
    if (!encryptedKey) {
      console.error(
        "Missing CRE keystore. Run: yarn cre:adapter:generate (delete .keystore/cre.json to regenerate).",
      );
      process.exit(1);
    }

    const pass = await password({
      message: "Enter password to decrypt CRE adapter private key (from cre:adapter:generate, not deployer):",
    });
    try {
      const wallet = (await Wallet.fromEncryptedJson(encryptedKey, pass)) as Wallet;
      process.env.__RUNTIME_CRE_ADAPTER_PRIVATE_KEY = wallet.privateKey;
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      console.error(`Failed to decrypt CRE adapter key. Use cre:adapter:generate password, not deployer. ${detail}`);
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
