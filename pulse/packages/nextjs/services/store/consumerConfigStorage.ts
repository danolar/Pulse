import type { ConsumerConfig } from "~~/types/consumer";
import { buildDefaultConsumerConfig } from "~~/types/consumer";

const STORAGE_PREFIX = "pulse:consumer-config:";

const storageKey = (consumerAddress: string): string =>
  `${STORAGE_PREFIX}${consumerAddress.toLowerCase()}`;

const loadConsumerConfigLocal = (consumerAddress: string): ConsumerConfig | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(storageKey(consumerAddress));
    if (!raw) return null;
    return JSON.parse(raw) as ConsumerConfig;
  } catch {
    return null;
  }
};

const saveConsumerConfigLocal = (consumerAddress: string, config: ConsumerConfig): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(consumerAddress), JSON.stringify(config));
};

export const loadConsumerConfig = async (consumerAddress: string): Promise<ConsumerConfig> => {
  const fallback = buildDefaultConsumerConfig(consumerAddress);

  try {
    const response = await fetch(`/api/consumer?address=${encodeURIComponent(consumerAddress)}`);

    if (response.status === 503 || !response.ok) {
      return loadConsumerConfigLocal(consumerAddress) ?? fallback;
    }

    const data = (await response.json()) as { config: ConsumerConfig | null };

    if (!data.config) {
      return loadConsumerConfigLocal(consumerAddress) ?? fallback;
    }

    saveConsumerConfigLocal(consumerAddress, data.config);
    return data.config;
  } catch {
    return loadConsumerConfigLocal(consumerAddress) ?? fallback;
  }
};

export const saveConsumerConfig = async (
  consumerAddress: string,
  config: ConsumerConfig,
): Promise<void> => {
  saveConsumerConfigLocal(consumerAddress, config);

  try {
    const response = await fetch("/api/consumer", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consumerAddress, config }),
    });

    if (response.status === 503 || !response.ok) {
      return;
    }
  } catch {
    // Local cache remains as offline fallback.
  }
};
