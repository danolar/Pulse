import { ethers } from "ethers";
import password from "@inquirer/password";
import * as fs from "fs";
import {
  CRE_KEYSTORE_PATH,
  upsertEnvValue,
  writeKeystoreJson,
} from "./keystoreFiles.js";

const envFilePath = "./.env";

async function main() {
  if (fs.existsSync(CRE_KEYSTORE_PATH)) {
    console.log("⚠️ CRE keystore already exists:", CRE_KEYSTORE_PATH);
    console.log("   Delete that file to regenerate, or run yarn cre:adapter:info");
    return;
  }

  console.log("👛 Generating dedicated CRE adapter wallet\n");
  const randomWallet = ethers.Wallet.createRandom();

  const pass = await password({ message: "Password to encrypt CRE adapter keystore:" });
  const confirmation = await password({ message: "Confirm password:" });
  if (pass !== confirmation) {
    console.error("Passwords do not match.");
    process.exit(1);
  }

  const encryptedJson = await randomWallet.encrypt(pass);
  writeKeystoreJson(CRE_KEYSTORE_PATH, encryptedJson);
  upsertEnvValue("CRE_ADAPTER_ADDRESS", randomWallet.address);

  console.log("\n📄 Keystore:", CRE_KEYSTORE_PATH);
  console.log("📄 Address in .env:", envFilePath);
  console.log("🪄 CRE adapter address:", randomWallet.address);
  console.log("\nNext:");
  console.log("  1. yarn cre:adapter:fund --network sepolia   (deployer password)");
  console.log("  2. yarn cre:adapter:authorize --network sepolia");
  console.log("  3. yarn cre:report -- --force                  (CRE password above)");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
