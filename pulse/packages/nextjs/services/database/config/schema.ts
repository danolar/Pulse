import "server-only";

import { integer, jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import type { PersistedPulseProfile } from "~~/services/store/pulseStore";

export const PULSE_PROFILE_SCHEMA_VERSION = 1;

export const pulseProfiles = pgTable("pulse_profiles", {
  walletAddress: varchar("wallet_address", { length: 42 }).primaryKey(),
  profileData: jsonb("profile_data").$type<PersistedPulseProfile>().notNull(),
  schemaVersion: integer("schema_version").notNull().default(PULSE_PROFILE_SCHEMA_VERSION),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});
