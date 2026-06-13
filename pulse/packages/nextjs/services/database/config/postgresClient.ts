import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeonHttp } from "drizzle-orm/neon-http";
import * as schema from "~~/services/database/config/schema";

export const PRODUCTION_DATABASE_HOSTNAME = "neon.tech";

type PulseDb = ReturnType<typeof drizzleNeonHttp<typeof schema>>;

let dbInstance: PulseDb | null = null;

export const isDatabaseConfigured = (): boolean => Boolean(process.env.POSTGRES_URL?.trim());

export function getDb(): PulseDb {
  if (dbInstance) return dbInstance;

  const connectionString = process.env.POSTGRES_URL?.trim();
  if (!connectionString) {
    throw new Error("Missing POSTGRES_URL. Add your Neon connection string to packages/nextjs/.env.local");
  }

  const sql = neon(connectionString);
  dbInstance = drizzleNeonHttp({ client: sql, schema, casing: "snake_case" });

  return dbInstance;
}

const dbProxy = new Proxy(
  {},
  {
    get: (_, prop) => {
      const database = getDb();
      return database[prop as keyof PulseDb];
    },
  },
);

export const db = dbProxy as PulseDb;
