import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeonHttp } from "drizzle-orm/neon-http";
import { drizzle as drizzleNodePostgres } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "~~/services/database/config/schema";

export const PRODUCTION_DATABASE_HOSTNAME = "neon.tech";

type PulseDb = ReturnType<typeof drizzleNeonHttp<typeof schema>> | ReturnType<typeof drizzleNodePostgres<typeof schema>>;

let dbInstance: PulseDb | null = null;
let poolInstance: Pool | null = null;

export const isDatabaseConfigured = (): boolean => Boolean(process.env.POSTGRES_URL?.trim());

export function getDb(): PulseDb {
  if (dbInstance) return dbInstance;

  const connectionString = process.env.POSTGRES_URL?.trim();
  if (!connectionString) {
    throw new Error("Missing POSTGRES_URL. Add your Neon connection string to packages/nextjs/.env.local");
  }

  if (connectionString.includes("neon")) {
    const sql = neon(connectionString);
    dbInstance = drizzleNeonHttp({ client: sql, schema, casing: "snake_case" });
  } else {
    poolInstance = new Pool({ connectionString });
    dbInstance = drizzleNodePostgres(poolInstance, { schema, casing: "snake_case" });
  }

  return dbInstance;
}

export async function closeDb(): Promise<void> {
  if (poolInstance) {
    await poolInstance.end();
    poolInstance = null;
    dbInstance = null;
  }
}

const dbProxy = new Proxy(
  {},
  {
    get: (_, prop) => {
      if (prop === "close") return closeDb;
      const database = getDb();
      return database[prop as keyof PulseDb];
    },
  },
);

export const db = dbProxy as PulseDb & { close: () => Promise<void> };
