import { HDNodeWallet, Mnemonic } from "ethers";

/** Standard Hardhat test mnemonic — account #3 is reserved for Sepolia CRE adapter only. */
const HARDHAT_MNEMONIC = "test test test test test test test test test test test junk";
export const HACKATHON_CRE_ADAPTER_INDEX = 3;

export const getHackathonCreAdapterWallet = (): HDNodeWallet => {
  const mnemonic = Mnemonic.fromPhrase(HARDHAT_MNEMONIC);
  return HDNodeWallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/${HACKATHON_CRE_ADAPTER_INDEX}`);
};

export const HACKATHON_CRE_ADAPTER_ADDRESS = getHackathonCreAdapterWallet().address as `0x${string}`;
