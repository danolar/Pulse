import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import type { VoiceCallAttempt, VoiceCallAttemptPublic } from "./types";

type CallRow = {
  id: string;
  profile_owner_address: string;
  check_in_code: string;
  call_sid: string | null;
  status: string;
  outcome: string | null;
  kind: string;
  created_at: string;
  completed_at: string | null;
};

let dbInstance: Database.Database | null = null;

const getDbPath = (): string => {
  if (process.env.VOICE_CALLS_DB_PATH?.trim()) {
    return process.env.VOICE_CALLS_DB_PATH.trim();
  }
  return path.resolve(process.cwd(), "../../.local/voice-calls.db");
};

const getDb = (): Database.Database => {
  if (dbInstance) return dbInstance;

  const dbPath = getDbPath();
  mkdirSync(path.dirname(dbPath), { recursive: true });

  dbInstance = new Database(dbPath);
  dbInstance.pragma("journal_mode = WAL");
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS voice_call_attempts (
      id TEXT PRIMARY KEY,
      profile_owner_address TEXT NOT NULL,
      check_in_code TEXT NOT NULL,
      call_sid TEXT,
      status TEXT NOT NULL,
      outcome TEXT,
      kind TEXT NOT NULL,
      created_at TEXT NOT NULL,
      completed_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_voice_calls_owner_created
      ON voice_call_attempts(profile_owner_address, created_at);
  `);

  return dbInstance;
};

const rowToAttempt = (row: CallRow): VoiceCallAttempt => ({
  id: row.id,
  profileOwnerAddress: row.profile_owner_address,
  checkInCode: row.check_in_code,
  callSid: row.call_sid,
  status: row.status as VoiceCallAttempt["status"],
  outcome: row.outcome as VoiceCallAttempt["outcome"],
  kind: row.kind as VoiceCallAttempt["kind"],
  createdAt: row.created_at,
  completedAt: row.completed_at,
});

const toPublic = (attempt: VoiceCallAttempt): VoiceCallAttemptPublic => ({
  id: attempt.id,
  checkInCode: attempt.checkInCode,
  status: attempt.status,
  outcome: attempt.outcome,
  kind: attempt.kind,
  callSid: attempt.callSid,
  createdAt: attempt.createdAt,
  completedAt: attempt.completedAt,
});

export const countCallsToday = (profileOwnerAddress: string): number => {
  const db = getDb();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const row = db
    .prepare(
      `
      SELECT COUNT(*) as count FROM voice_call_attempts
      WHERE profile_owner_address = ? AND created_at >= ?
    `,
    )
    .get(profileOwnerAddress.toLowerCase(), startOfDay.toISOString()) as { count: number };

  return row.count;
};

export const createCallAttempt = (input: {
  profileOwnerAddress: string;
  checkInCode: string;
  kind: VoiceCallAttempt["kind"];
}): VoiceCallAttempt => {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(
    `
    INSERT INTO voice_call_attempts (
      id, profile_owner_address, check_in_code, call_sid, status, outcome, kind, created_at, completed_at
    ) VALUES (?, ?, ?, NULL, 'pending', NULL, ?, ?, NULL)
  `,
  ).run(id, input.profileOwnerAddress.toLowerCase(), input.checkInCode, input.kind, now);

  return rowToAttempt(
    db.prepare(`SELECT * FROM voice_call_attempts WHERE id = ?`).get(id) as CallRow,
  );
};

export const getCallAttempt = (attemptId: string): VoiceCallAttempt | null => {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM voice_call_attempts WHERE id = ?`).get(attemptId) as CallRow | undefined;
  return row ? rowToAttempt(row) : null;
};

export const getCallAttemptPublic = (attemptId: string): VoiceCallAttemptPublic | null => {
  const attempt = getCallAttempt(attemptId);
  return attempt ? toPublic(attempt) : null;
};

export const attachCallSid = (attemptId: string, callSid: string): void => {
  const db = getDb();
  db.prepare(`UPDATE voice_call_attempts SET call_sid = ?, status = 'calling' WHERE id = ?`).run(callSid, attemptId);
};

export const completeCallAttempt = (input: {
  attemptId: string;
  outcome: NonNullable<VoiceCallAttempt["outcome"]>;
  status: VoiceCallAttempt["status"];
}): VoiceCallAttempt | null => {
  const db = getDb();
  const now = new Date().toISOString();

  db.prepare(
    `
    UPDATE voice_call_attempts
    SET status = ?, outcome = ?, completed_at = ?
    WHERE id = ?
  `,
  ).run(input.status, input.outcome, now, input.attemptId);

  return getCallAttempt(input.attemptId);
};

export const getLatestCallAttempt = (profileOwnerAddress: string): VoiceCallAttemptPublic | null => {
  const db = getDb();
  const row = db
    .prepare(
      `
      SELECT * FROM voice_call_attempts
      WHERE profile_owner_address = ?
      ORDER BY created_at DESC LIMIT 1
    `,
    )
    .get(profileOwnerAddress.toLowerCase()) as CallRow | undefined;

  return row ? toPublic(rowToAttempt(row)) : null;
};
