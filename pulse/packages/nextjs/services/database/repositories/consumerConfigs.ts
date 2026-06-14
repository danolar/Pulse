import "server-only";

import { eq } from "drizzle-orm";
import {
  CONSUMER_CONFIG_SCHEMA_VERSION,
  pulseConsumers,
} from "~~/services/database/config/schema";
import { db } from "~~/services/database/config/postgresClient";
import type { ConsumerConfig } from "~~/types/consumer";

export const getConsumerConfigByAddress = async (
  consumerAddress: string,
): Promise<ConsumerConfig | null> => {
  const normalizedAddress = consumerAddress.toLowerCase();

  const row = await db.query.pulseConsumers.findFirst({
    where: eq(pulseConsumers.consumerAddress, normalizedAddress),
  });

  if (!row || row.schemaVersion !== CONSUMER_CONFIG_SCHEMA_VERSION) {
    return null;
  }

  return row.configData;
};

export const upsertConsumerConfig = async (
  consumerAddress: string,
  config: ConsumerConfig,
): Promise<ConsumerConfig> => {
  const normalizedAddress = consumerAddress.toLowerCase();
  const now = new Date().toISOString();
  const payload: ConsumerConfig = {
    ...config,
    consumerAddress: normalizedAddress,
    schemaVersion: CONSUMER_CONFIG_SCHEMA_VERSION,
  };

  await db
    .insert(pulseConsumers)
    .values({
      consumerAddress: normalizedAddress,
      configData: payload,
      schemaVersion: CONSUMER_CONFIG_SCHEMA_VERSION,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: pulseConsumers.consumerAddress,
      set: {
        configData: payload,
        schemaVersion: CONSUMER_CONFIG_SCHEMA_VERSION,
        updatedAt: now,
      },
    });

  return payload;
};
