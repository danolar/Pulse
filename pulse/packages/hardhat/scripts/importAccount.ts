import { ethers } from "ethers";
import * as fs from "fs";
import password from "@inquirer/password";
import {
  DEPLOYER_KEYSTORE_PATH,
  upsertEnvValue,
  writeKeystoreJson,
} from "./keystoreFiles.js";

const envFilePath = "./.env";

const getValidatedPassword = async () => {
  while (true) {
    const pass = await password({ message: "Enter a password to encrypt your private key:" });
    const confirmation = await password({ message: "Confirm password:" });

    if (pass === confirmation) {
      return pass;
    }
    console.log("❌ Passwords don't match. Please try again.");
  }
};

const getWalletFromPrivateKey = async () => {
  while (true) {
    const privateKey = await password({ message: "Paste your private key:" });
    try {
      const wallet = new ethers.Wallet(privateKey);
      return wallet;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      console.log("❌ Invalid private key format. Please try again.");
    }
  }
};

const setNewEnvConfig = async () => {
  console.log("👛 Importing Wallet\n");

  const wallet = await getWalletFromPrivateKey();

  const pass = await getValidatedPassword();
  const encryptedJson = await wallet.encrypt(pass);

  writeKeystoreJson(DEPLOYER_KEYSTORE_PATH, encryptedJson);
  upsertEnvValue("DEPLOYER_ADDRESS", wallet.address);

  console.log("\n📄 Encrypted keystore saved to packages/hardhat/.keystore/deployer.json");
  console.log("🪄 Imported wallet address:", wallet.address, "\n");
  console.log("⚠️ Make sure to remember your password! You'll need it to decrypt the private key.");
};

async function main() {
  if (fs.existsSync(DEPLOYER_KEYSTORE_PATH)) {
    console.log("⚠️ Deployer keystore already exists. Run yarn account:reimport-deployer to replace it.");
    return;
  }

  await setNewEnvConfig();
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
