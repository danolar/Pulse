/** Pulse-hosted adapters — consumer sets weight; Pulse infra reports via authorized signers. */

export const INTERNAL_ADAPTER_IDS = ["onchain-activity", "google-activity", "twilio-voice"] as const;

export type InternalAdapterId = (typeof INTERNAL_ADAPTER_IDS)[number];

export const isInternalAdapterId = (id: string): id is InternalAdapterId =>
  (INTERNAL_ADAPTER_IDS as readonly string[]).includes(id);

/** Local Hardhat accounts #0–#2 — each internal adapter gets a distinct signer in dev. */
const DEV_ADAPTER_ADDRESSES: Record<InternalAdapterId, `0x${string}`> = {
  "onchain-activity": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "google-activity": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "twilio-voice": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
};

const ENV_KEYS: Record<InternalAdapterId, string> = {
  "onchain-activity": "NEXT_PUBLIC_PULSE_ONCHAIN_ADAPTER_ADDRESS",
  "google-activity": "NEXT_PUBLIC_PULSE_GOOGLE_ADAPTER_ADDRESS",
  "twilio-voice": "NEXT_PUBLIC_PULSE_VOICE_ADAPTER_ADDRESS",
};

const isHexAddress = (value: string | undefined): value is `0x${string}` =>
  Boolean(value?.startsWith("0x") && value.length === 42);

/** Authorized signer that calls PulseOracle.reportSignal for this internal adapter. */
export const getInternalAdapterAddress = (catalogId: InternalAdapterId): `0x${string}` => {
  const specific = process.env[ENV_KEYS[catalogId]]?.trim();
  if (isHexAddress(specific)) return specific;

  const shared = process.env.NEXT_PUBLIC_PULSE_INTERNAL_ADAPTER_ADDRESS?.trim();
  if (isHexAddress(shared)) return shared;

  return DEV_ADAPTER_ADDRESSES[catalogId];
};

export type InternalAdapterProvider = {
  name: string;
  role: string;
  deployNote: string;
};

export const INTERNAL_ADAPTER_PROVIDERS: Record<InternalAdapterId, InternalAdapterProvider> = {
  "onchain-activity": {
    name: "Chainlink CRE",
    role: "Passive wallet inactivity monitoring",
    deployNote:
      "Deploy PulseOracle (yarn deploy --tags PulseOracle), then authorizeAdapter with the signer below when creating each profile.",
  },
  "google-activity": {
    name: "Google APIs",
    role: "Passive account activity signals",
    deployNote:
      "Pulse hosts OAuth. Your users link Google inside your app; you authorizeAdapter with the signer below per profile.",
  },
  "twilio-voice": {
    name: "Twilio Voice",
    role: "Active voice check-in signals",
    deployNote:
      "Pulse hosts Twilio. Your users link a phone in your app; you authorizeAdapter with the signer below per profile.",
  },
};

export const INTERNAL_ADAPTERS_INTRO =
  "These adapters run on Pulse infrastructure (Chainlink CRE, Google, Twilio). Deploy PulseOracle once, then authorizeAdapter with each signer address when you create a profile — no adapter contracts to deploy.";

export const PULSE_ORACLE_DEPLOY_NOTE =
  "PulseOracle is the only onchain contract you deploy (or reuse Pulse's official deployment). Internal adapters are authorized addresses, not separate contracts.";
