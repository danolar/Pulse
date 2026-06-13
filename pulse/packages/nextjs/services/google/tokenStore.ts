import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { getGoogleOAuthEnv } from "./config";
import { decryptSecret, encryptSecret } from "./crypto";
import type {
  GoogleConnectionPublic,
  GoogleConnectionRecord,
  GoogleSurfacesConfig,
  UpsertGoogleConnectionInput,
} from "./types";
import { DEFAULT_GOOGLE_SURFACES } from "./types";

type ConnectionRow = {
  id: string;
  profile_owner_address: string;
  google_sub: string;
  google_email: string | null;
  refresh_token_encrypted: string;
  surfaces_json: string;
  gmail_history_id: string | null;
  drive_start_page_token: string | null;
  connected_at: string;
  revoked_at: string | null;
};

let dbInstance: Database.Database | null = null;

const getDbPath = (): string => {
  if (process.env.GOOGLE_CONNECTIONS_DB_PATH?.trim()) {
    return process.env.GOOGLE_CONNECTIONS_DB_PATH.trim();
  }

  return path.resolve(process.cwd(), "../../.local/google-connections.db");
};

const getDb = (): Database.Database => {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = getDbPath();
  mkdirSync(path.dirname(dbPath), { recursive: true });

  dbInstance = new Database(dbPath);
  dbInstance.pragma("journal_mode = WAL");
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS google_connections (
      id TEXT PRIMARY KEY,
      profile_owner_address TEXT NOT NULL,
      google_sub TEXT NOT NULL,
      google_email TEXT,
      refresh_token_encrypted TEXT NOT NULL,
      surfaces_json TEXT NOT NULL,
      gmail_history_id TEXT,
      drive_start_page_token TEXT,
      connected_at TEXT NOT NULL,
      revoked_at TEXT
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_google_connections_owner_sub
      ON google_connections(profile_owner_address, google_sub);
  `);

  return dbInstance;
};

const parseSurfaces = (raw: string): GoogleSurfacesConfig => {
  try {
    const parsed = JSON.parse(raw) as Partial<GoogleSurfacesConfig>;
    return {
      gmailSend: parsed.gmailSend ?? DEFAULT_GOOGLE_SURFACES.gmailSend,
      gmailReceive: parsed.gmailReceive ?? DEFAULT_GOOGLE_SURFACES.gmailReceive,
      calendar: parsed.calendar ?? DEFAULT_GOOGLE_SURFACES.calendar,
      drive: parsed.drive ?? DEFAULT_GOOGLE_SURFACES.drive,
    };
  } catch {
    return { ...DEFAULT_GOOGLE_SURFACES };
  }
};

const rowToRecord = (row: ConnectionRow): GoogleConnectionRecord => ({
  id: row.id,
  profileOwnerAddress: row.profile_owner_address,
  googleSub: row.google_sub,
  googleEmail: row.google_email,
  surfaces: parseSurfaces(row.surfaces_json),
  gmailHistoryId: row.gmail_history_id,
  driveStartPageToken: row.drive_start_page_token,
  connectedAt: row.connected_at,
  revokedAt: row.revoked_at,
});

const toPublicConnection = (record: GoogleConnectionRecord): GoogleConnectionPublic => ({
  connected: record.revokedAt === null,
  profileOwnerAddress: record.profileOwnerAddress,
  googleSub: record.googleSub,
  googleEmail: record.googleEmail,
  surfaces: record.surfaces,
  gmailHistoryId: record.gmailHistoryId,
  driveStartPageToken: record.driveStartPageToken,
  connectedAt: record.connectedAt,
  revokedAt: record.revokedAt,
});

export const upsertGoogleConnection = (input: UpsertGoogleConnectionInput): GoogleConnectionPublic => {
  const { encryptionKeyHex } = getGoogleOAuthEnv();
  const db = getDb();
  const now = new Date().toISOString();
  const profileOwner = input.profileOwnerAddress.toLowerCase();
  const id = randomUUID();

  const encryptedRefreshToken = encryptSecret(input.refreshToken, encryptionKeyHex);

  db.prepare(
    `
    INSERT INTO google_connections (
      id,
      profile_owner_address,
      google_sub,
      google_email,
      refresh_token_encrypted,
      surfaces_json,
      connected_at,
      revoked_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, NULL)
    ON CONFLICT(profile_owner_address, google_sub) DO UPDATE SET
      google_email = excluded.google_email,
      refresh_token_encrypted = excluded.refresh_token_encrypted,
      surfaces_json = excluded.surfaces_json,
      connected_at = excluded.connected_at,
      revoked_at = NULL
  `,
  ).run(
    id,
    profileOwner,
    input.googleSub,
    input.googleEmail,
    encryptedRefreshToken,
    JSON.stringify(input.surfaces),
    now,
  );

  const row = db
    .prepare(
      `
      SELECT * FROM google_connections
      WHERE profile_owner_address = ? AND google_sub = ? AND revoked_at IS NULL
      ORDER BY connected_at DESC
      LIMIT 1
    `,
    )
    .get(profileOwner, input.googleSub) as ConnectionRow | undefined;

  if (!row) {
    throw new Error("Failed to persist Google connection.");
  }

  return toPublicConnection(rowToRecord(row));
};

export const getActiveGoogleConnection = (profileOwnerAddress: string): GoogleConnectionPublic | null => {
  const db = getDb();
  const row = db
    .prepare(
      `
      SELECT * FROM google_connections
      WHERE profile_owner_address = ? AND revoked_at IS NULL
      ORDER BY connected_at DESC
      LIMIT 1
    `,
    )
    .get(profileOwnerAddress.toLowerCase()) as ConnectionRow | undefined;

  if (!row) {
    return null;
  }

  return toPublicConnection(rowToRecord(row));
};

export const revokeGoogleConnection = (profileOwnerAddress: string): boolean => {
  const db = getDb();
  const result = db
    .prepare(
      `
      UPDATE google_connections
      SET revoked_at = ?
      WHERE profile_owner_address = ? AND revoked_at IS NULL
    `,
    )
    .run(new Date().toISOString(), profileOwnerAddress.toLowerCase());

  return result.changes > 0;
};

export const getDecryptedRefreshToken = (profileOwnerAddress: string): string | null => {
  const { encryptionKeyHex } = getGoogleOAuthEnv();
  const db = getDb();
  const row = db
    .prepare(
      `
      SELECT refresh_token_encrypted FROM google_connections
      WHERE profile_owner_address = ? AND revoked_at IS NULL
      ORDER BY connected_at DESC
      LIMIT 1
    `,
    )
    .get(profileOwnerAddress.toLowerCase()) as { refresh_token_encrypted: string } | undefined;

  if (!row) {
    return null;
  }

  return decryptSecret(row.refresh_token_encrypted, encryptionKeyHex);
};
