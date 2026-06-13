const url = process.env.POSTGRES_URL?.trim();

if (!url) {
  console.error("Missing POSTGRES_URL in packages/nextjs/.env.local");
  process.exit(1);
}

if (!url.includes("neon") && !url.startsWith("postgresql://")) {
  console.error("POSTGRES_URL should be a postgresql:// connection string (Neon or local Postgres).");
  process.exit(1);
}

console.log("POSTGRES_URL is set.");
