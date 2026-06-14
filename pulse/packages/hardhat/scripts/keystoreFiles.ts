import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
export const KEYSTORE_DIR = path.resolve(scriptsDir, "../.keystore");

export const DEPLOYER_KEYSTORE_PATH = path.join(KEYSTORE_DIR, "deployer.json");
export const CRE_KEYSTORE_PATH = path.join(KEYSTORE_DIR, "cre.json");

export const readKeystoreJson = (filePath: string): string | undefined => {
  if (!fs.existsSync(filePath)) return undefined;
  const raw = fs.readFileSync(filePath, "utf8").trim();
  if (!raw) return undefined;
  JSON.parse(raw);
  return raw;
};

export const writeKeystoreJson = (filePath: string, encryptedJson: string): void => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  JSON.parse(encryptedJson);
  fs.writeFileSync(filePath, encryptedJson, "utf8");
};

export const readDeployerKeystoreJson = (): string | undefined => {
  const fromFile = readKeystoreJson(DEPLOYER_KEYSTORE_PATH);
  if (fromFile) return fromFile;

  const fromEnv = process.env.DEPLOYER_PRIVATE_KEY_ENCRYPTED?.trim();
  if (!fromEnv) return undefined;

  if (fromEnv.startsWith("{")) {
    try {
      JSON.parse(fromEnv);
      return fromEnv;
    } catch {
      return undefined;
    }
  }

  return undefined;
};

export const readCreKeystoreJson = (): string | undefined => {
  const fromFile = readKeystoreJson(CRE_KEYSTORE_PATH);
  if (fromFile) return fromFile;

  const fromEnv = process.env.CRE_ADAPTER_PRIVATE_KEY_ENCRYPTED?.trim();
  if (!fromEnv) return undefined;

  if (fromEnv.startsWith("{")) {
    try {
      JSON.parse(fromEnv);
      return fromEnv;
    } catch {
      return undefined;
    }
  }

  return undefined;
};

export const upsertEnvValue = (key: string, value: string): void => {
  const envPath = path.resolve(scriptsDir, "../.env");
  const lines = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8").split("\n") : [];
  const prefix = `${key}=`;
  let found = false;
  const next = lines.map(line => {
    if (line.startsWith(prefix)) {
      found = true;
      return `${prefix}${value}`;
    }
    return line;
  });
  if (!found) next.push(`${prefix}${value}`);
  fs.writeFileSync(envPath, next.filter((line, i, arr) => line.length > 0 || i < arr.length - 1).join("\n") + "\n");
};
