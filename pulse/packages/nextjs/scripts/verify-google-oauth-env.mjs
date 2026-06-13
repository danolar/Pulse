const required = [
  "GOOGLE_OAUTH_CLIENT_ID",
  "GOOGLE_OAUTH_CLIENT_SECRET",
  "GOOGLE_OAUTH_REDIRECT_URI",
  "GOOGLE_TOKEN_ENCRYPTION_KEY",
];

const missing = required.filter(key => !process.env[key]?.trim());

if (missing.length > 0) {
  console.error("Missing Google OAuth env vars:", missing.join(", "));
  process.exit(1);
}

const encryptionKey = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY ?? "";
if (!/^[0-9a-fA-F]{64}$/.test(encryptionKey)) {
  console.error("GOOGLE_TOKEN_ENCRYPTION_KEY must be 64 hex characters. Run: openssl rand -hex 32");
  process.exit(1);
}

console.log("Google OAuth env OK");
