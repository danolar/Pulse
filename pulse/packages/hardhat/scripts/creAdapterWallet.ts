import { Wallet, getAddress } from "ethers";
import password from "@inquirer/password";
import { readCreKeystoreJson } from "./keystoreFiles.js";

export const getCreAdapterAddressFromEnv = (): `0x${string}` | null => {
  const fromEnv = process.env.CRE_ADAPTER_ADDRESS?.trim();
  if (!fromEnv) return null;
  return getAddress(fromEnv) as `0x${string}`;
};

export const resolveCreAdapterPrivateKey = async (): Promise<string> => {
  const runtime = process.env.__RUNTIME_CRE_ADAPTER_PRIVATE_KEY?.trim();
  if (runtime) return runtime;

  const plain = process.env.CRE_ADAPTER_PRIVATE_KEY?.trim();
  if (plain) return plain;

  const encryptedKey = readCreKeystoreJson();
  if (!encryptedKey) {
    throw new Error(
      "No CRE keystore found. Run yarn cre:adapter:generate (stores packages/hardhat/.keystore/cre.json).",
    );
  }

  const pass = await password({
    message: "Enter password to decrypt CRE adapter private key (from yarn cre:adapter:generate, not deployer):",
  });
  try {
    const wallet = (await Wallet.fromEncryptedJson(encryptedKey, pass)) as Wallet;
    return wallet.privateKey;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to decrypt CRE adapter key. Use the password from cre:adapter:generate (not deployer). Detail: ${detail}`,
    );
  }
};

export const getCreAdapterWallet = async (provider?: import("ethers").Provider) => {
  const privateKey = await resolveCreAdapterPrivateKey();
  return provider ? new Wallet(privateKey, provider) : new Wallet(privateKey);
};

export const getCreAdapterAddress = async (): Promise<`0x${string}`> => {
  const fromEnv = getCreAdapterAddressFromEnv();
  if (fromEnv) return fromEnv;
  const wallet = await getCreAdapterWallet();
  return wallet.address as `0x${string}`;
};
