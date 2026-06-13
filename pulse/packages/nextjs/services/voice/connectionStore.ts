import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { getTwilioVoiceEnv } from "./config";
import { decryptSecret, encryptSecret } from "./crypto";
import { maskPhoneNumber } from "./phone";
import type { VoiceConnectionPublic, VoiceConnectionRecord } from "./types";

type ConnectionRow = {
  id: string;
  profile_owner_address: string;
  phone_encrypted: string;
  status: string;
  validation_code: string | null;
  connected_at: string | null;
  revoked_at: string | null;
};

let dbInstance: Database.Database | null = null;

const getDbPath = (): string => {
  if (process.env.VOICE_CONNECTIONS_DB_PATH?.trim()) {
    return process.env.VOICE_CONNECTIONS_DB_PATH.trim();
  }
  return path.resolve(process.cwd(), "../../.local/voice-connections.db");
};

const getDb = (): Database.Database => {
  if (dbInstance) return dbInstance;

  const dbPath = getDbPath();
  mkdirSync(path.dirname(dbPath), { recursive: true });

  dbInstance = new Database(dbPath);
  dbInstance.pragma("journal_mode = WAL");
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS voice_connections (
      id TEXT PRIMARY KEY,
      profile_owner_address TEXT NOT NULL,
      phone_encrypted TEXT NOT NULL,
      status TEXT NOT NULL,
      validation_code TEXT,
      connected_at TEXT,
      revoked_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_voice_connections_owner
      ON voice_connections(profile_owner_address);
  `);

  return dbInstance;
};

const rowToRecord = (row: ConnectionRow): VoiceConnectionRecord => ({
  id: row.id,
  profileOwnerAddress: row.profile_owner_address,
  phoneEncrypted: row.phone_encrypted,
  status: row.status as VoiceConnectionRecord["status"],
  validationCode: row.validation_code,
  connectedAt: row.connected_at,
  revokedAt: row.revoked_at,
});

const decryptPhone = (record: VoiceConnectionRecord): string =>
  decryptSecret(record.phoneEncrypted, getTwilioVoiceEnv().encryptionKeyHex);

export const toPublicConnection = (record: VoiceConnectionRecord | null): VoiceConnectionPublic => {
  if (!record || record.status === "revoked") {
    return {
      connected: false,
      profileOwnerAddress: record?.profileOwnerAddress ?? "",
      phoneMasked: null,
      phoneLast4: null,
      verificationPending: false,
      validationCode: null,
      connectedAt: null,
    };
  }

  const phone = decryptPhone(record);
  const { masked, last4 } = maskPhoneNumber(phone);

  return {
    connected: record.status === "verified",
    profileOwnerAddress: record.profileOwnerAddress,
    phoneMasked: masked,
    phoneLast4: last4,
    verificationPending: record.status === "pending",
    validationCode: record.status === "pending" ? record.validationCode : null,
    connectedAt: record.connectedAt,
  };
};

export const getVoiceConnection = (profileOwnerAddress: string): VoiceConnectionPublic => {
  const db = getDb();
  const owner = profileOwnerAddress.toLowerCase();

  const row = db
    .prepare(
      `
      SELECT * FROM voice_connections
      WHERE profile_owner_address = ? AND revoked_at IS NULL
      ORDER BY connected_at DESC, rowid DESC
      LIMIT 1
    `,
    )
    .get(owner) as ConnectionRow | undefined;

  return toPublicConnection(row ? rowToRecord(row) : null);
};

export const getVerifiedPhoneNumber = (profileOwnerAddress: string): string | null => {
  const db = getDb();
  const owner = profileOwnerAddress.toLowerCase();
  const row = db
    .prepare(
      `
      SELECT * FROM voice_connections
      WHERE profile_owner_address = ? AND status = 'verified' AND revoked_at IS NULL
      ORDER BY connected_at DESC
      LIMIT 1
    `,
    )
    .get(owner) as ConnectionRow | undefined;

  if (!row) return null;
  return decryptPhone(rowToRecord(row));
};

export const upsertPendingVoiceConnection = (input: {
  profileOwnerAddress: string;
  phoneNumber: string;
  validationCode?: string | null;
}): VoiceConnectionPublic => {
  const { encryptionKeyHex } = getTwilioVoiceEnv();
  const db = getDb();
  const owner = input.profileOwnerAddress.toLowerCase();
  const now = new Date().toISOString();

  db.prepare(`UPDATE voice_connections SET revoked_at = ? WHERE profile_owner_address = ? AND revoked_at IS NULL`).run(
    now,
    owner,
  );

  const id = randomUUID();
  db.prepare(
    `
    INSERT INTO voice_connections (
      id, profile_owner_address, phone_encrypted, status, validation_code, connected_at, revoked_at
    ) VALUES (?, ?, ?, 'pending', ?, NULL, NULL)
  `,
  ).run(id, owner, encryptSecret(input.phoneNumber, encryptionKeyHex), input.validationCode ?? null);

  return getVoiceConnection(owner);
};

export const markVoiceConnectionVerified = (profileOwnerAddress: string): VoiceConnectionPublic => {
  const db = getDb();
  const owner = profileOwnerAddress.toLowerCase();
  const now = new Date().toISOString();

  db.prepare(
    `
    UPDATE voice_connections
    SET status = 'verified', connected_at = ?, validation_code = NULL
    WHERE profile_owner_address = ? AND status = 'pending' AND revoked_at IS NULL
  `,
  ).run(now, owner);

  return getVoiceConnection(owner);
};

export const revokeVoiceConnection = (profileOwnerAddress: string): boolean => {
  const db = getDb();
  const result = db
    .prepare(
      `
      UPDATE voice_connections SET revoked_at = ?, status = 'revoked'
      WHERE profile_owner_address = ? AND revoked_at IS NULL
    `,
    )
    .run(new Date().toISOString(), profileOwnerAddress.toLowerCase());

  return result.changes > 0;
};

export const getPendingPhoneNumber = (profileOwnerAddress: string): string | null => {
  const db = getDb();
  const row = db
    .prepare(
      `
      SELECT * FROM voice_connections
      WHERE profile_owner_address = ? AND status = 'pending' AND revoked_at IS NULL
      ORDER BY rowid DESC LIMIT 1
    `,
    )
    .get(profileOwnerAddress.toLowerCase()) as ConnectionRow | undefined;

  if (!row) return null;
  return decryptPhone(rowToRecord(row));
};
