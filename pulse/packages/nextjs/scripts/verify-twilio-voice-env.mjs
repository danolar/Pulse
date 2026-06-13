const required = ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_FROM_NUMBER"];

const missing = required.filter(key => !process.env[key]?.trim());

if (missing.length > 0) {
  console.error("Missing Twilio env vars:", missing.join(", "));
  process.exit(1);
}

const encryptionKey =
  process.env.VOICE_TOKEN_ENCRYPTION_KEY?.trim() || process.env.GOOGLE_TOKEN_ENCRYPTION_KEY?.trim() || "";

if (!/^[0-9a-fA-F]{64}$/.test(encryptionKey)) {
  console.error(
    "VOICE_TOKEN_ENCRYPTION_KEY or GOOGLE_TOKEN_ENCRYPTION_KEY must be 64 hex characters. Run: openssl rand -hex 32",
  );
  process.exit(1);
}

if (process.env.VOICE_CALLS_ENABLED?.trim().toLowerCase() === "true" && !process.env.TWILIO_WEBHOOK_BASE_URL?.trim()) {
  console.error("TWILIO_WEBHOOK_BASE_URL is required when VOICE_CALLS_ENABLED=true");
  process.exit(1);
}

console.log("Twilio voice env OK");
