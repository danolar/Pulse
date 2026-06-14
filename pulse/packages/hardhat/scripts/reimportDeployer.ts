import { ethers } from "ethers";
import password from "@inquirer/password";
import {
  DEPLOYER_KEYSTORE_PATH,
  upsertEnvValue,
  writeKeystoreJson,
} from "./keystoreFiles.js";

async function main() {
  console.log("Re-import deployer wallet → packages/hardhat/.keystore/deployer.json\n");

  const privateKey = await password({ message: "Paste your deployer private key (0x…):" });
  let wallet: ethers.Wallet;
  try {
    wallet = new ethers.Wallet(privateKey.trim());
  } catch {
    console.error("Invalid private key format.");
    process.exit(1);
  }

  const pass = await password({ message: "Password to encrypt this keystore:" });
  const confirmation = await password({ message: "Confirm password:" });
  if (pass !== confirmation) {
    console.error("Passwords do not match.");
    process.exit(1);
  }

  const encryptedJson = await wallet.encrypt(pass);
  writeKeystoreJson(DEPLOYER_KEYSTORE_PATH, encryptedJson);
  upsertEnvValue("DEPLOYER_ADDRESS", wallet.address);

  console.log("\n✅ Keystore saved:", DEPLOYER_KEYSTORE_PATH);
  console.log("Address:", wallet.address);
  console.log("\nYou can remove broken DEPLOYER_PRIVATE_KEY_ENCRYPTED=… lines from .env (optional).");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
