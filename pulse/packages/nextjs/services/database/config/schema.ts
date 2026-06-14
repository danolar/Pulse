import { integer, jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import type { ConsumerConfig } from "../../../types/consumer";

export const PULSE_PROFILE_SCHEMA_VERSION = 1;
export const CONSUMER_CONFIG_SCHEMA_VERSION = 1;

/** @deprecated End-user profile blobs — runtime state moves onchain; kept for migration. */
export const pulseProfiles = pgTable("pulse_profiles", {
  walletAddress: varchar("wallet_address", { length: 42 }).primaryKey(),
  profileData: jsonb("profile_data").$type<Record<string, unknown>>().notNull(),
  schemaVersion: integer("schema_version").notNull().default(PULSE_PROFILE_SCHEMA_VERSION),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

/** Consumer integration config — one row per consumer wallet (sole admin, like contract deployer). */
export const pulseConsumers = pgTable("pulse_consumers", {
  consumerAddress: varchar("consumer_address", { length: 42 }).primaryKey(),
  configData: jsonb("config_data").$type<ConsumerConfig>().notNull(),
  schemaVersion: integer("schema_version").notNull().default(CONSUMER_CONFIG_SCHEMA_VERSION),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});
