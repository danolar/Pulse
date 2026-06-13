import "server-only";

import { eq } from "drizzle-orm";
import {
  PULSE_PROFILE_SCHEMA_VERSION,
  pulseProfiles,
} from "~~/services/database/config/schema";
import { db } from "~~/services/database/config/postgresClient";
import type { PersistedPulseProfile } from "~~/services/store/pulseStore";

export const getPulseProfileByWallet = async (
  walletAddress: string,
): Promise<PersistedPulseProfile | null> => {
  const normalizedAddress = walletAddress.toLowerCase();

  const row = await db.query.pulseProfiles.findFirst({
    where: eq(pulseProfiles.walletAddress, normalizedAddress),
  });

  if (!row || row.schemaVersion !== PULSE_PROFILE_SCHEMA_VERSION) {
    return null;
  }

  return row.profileData;
};

export const upsertPulseProfile = async (
  walletAddress: string,
  profile: PersistedPulseProfile,
): Promise<PersistedPulseProfile> => {
  const normalizedAddress = walletAddress.toLowerCase();
  const now = new Date().toISOString();

  await db
    .insert(pulseProfiles)
    .values({
      walletAddress: normalizedAddress,
      profileData: profile,
      schemaVersion: PULSE_PROFILE_SCHEMA_VERSION,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: pulseProfiles.walletAddress,
      set: {
        profileData: profile,
        schemaVersion: PULSE_PROFILE_SCHEMA_VERSION,
        updatedAt: now,
      },
    });

  return profile;
};
