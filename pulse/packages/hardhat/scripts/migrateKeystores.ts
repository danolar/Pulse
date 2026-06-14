import * as fs from "fs";
import {
  CRE_KEYSTORE_PATH,
  DEPLOYER_KEYSTORE_PATH,
  upsertEnvValue,
  writeKeystoreJson,
} from "./keystoreFiles.js";

const envPath = "./.env";

const extractJsonLine = (raw: string, key: string): string | undefined => {
  const prefix = `${key}=`;
  const line = raw.split("\n").find(entry => entry.startsWith(prefix));
  if (!line) return undefined;
  const value = line.slice(prefix.length).trim();
  if (!value.startsWith("{")) return undefined;
  try {
    JSON.parse(value);
    return value;
  } catch {
    return undefined;
  }
};

async function main() {
  if (!fs.existsSync(envPath)) {
    console.log("No .env file found.");
    return;
  }

  const raw = fs.readFileSync(envPath, "utf8");
  let migrated = 0;

  if (!fs.existsSync(DEPLOYER_KEYSTORE_PATH)) {
    const deployerJson = extractJsonLine(raw, "DEPLOYER_PRIVATE_KEY_ENCRYPTED");
    if (deployerJson) {
      writeKeystoreJson(DEPLOYER_KEYSTORE_PATH, deployerJson);
      console.log("✅ Migrated deployer keystore → .keystore/deployer.json");
      migrated++;
    } else {
      console.log("⚠️ Deployer keystore in .env is corrupt — run yarn account:reimport-deployer");
    }
  }

  if (!fs.existsSync(CRE_KEYSTORE_PATH)) {
    const creJson = extractJsonLine(raw, "CRE_ADAPTER_PRIVATE_KEY_ENCRYPTED");
    if (creJson) {
      writeKeystoreJson(CRE_KEYSTORE_PATH, creJson);
      const parsed = JSON.parse(creJson) as { address?: string };
      if (parsed.address) upsertEnvValue("CRE_ADAPTER_ADDRESS", parsed.address);
      console.log("✅ Migrated CRE keystore → .keystore/cre.json");
      migrated++;
    }
  }

  if (migrated === 0) {
    console.log("Nothing to migrate (keystore files already exist or .env JSON lines invalid).");
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
