import type { ConfiguredAdapter, ProfileConfig } from "~~/types/pulse";

export const CONSUMER_CONFIG_SCHEMA_VERSION = 1;

export type RandomnessAgentConfig = {
  source: "blockhash" | "chainlink-vrf";
  /** Chainlink VRF coordinator (production). */
  vrfCoordinator?: string;
  /** Chainlink VRF subscription id (production). */
  subscriptionId?: string;
};

export type ConsumerConfig = {
  schemaVersion: typeof CONSUMER_CONFIG_SCHEMA_VERSION;
  consumerAddress: string;
  setupComplete: boolean;
  configuredAdapters: ConfiguredAdapter[];
  rhythmConfig: ProfileConfig;
  notificationTarget: string | null;
  randomnessAgent: RandomnessAgentConfig;
  /** Dev acknowledged World ID action table for embed in their app — not a onchain write. */
  identityIntegrated: boolean;
};

export const DEFAULT_RANDOMNESS_AGENT: RandomnessAgentConfig = {
  source: "blockhash",
};

export const buildDefaultConsumerConfig = (consumerAddress: string): ConsumerConfig => ({
  schemaVersion: CONSUMER_CONFIG_SCHEMA_VERSION,
  consumerAddress: consumerAddress.toLowerCase(),
  setupComplete: false,
  configuredAdapters: [],
  rhythmConfig: {
    windowDuration: 60,
    attemptsPerWindow: 5,
    responseWindow: 36,
    missedAttemptWeight: 15,
    threshold: 100,
  },
  notificationTarget: null,
  randomnessAgent: { ...DEFAULT_RANDOMNESS_AGENT },
  identityIntegrated: false,
});
