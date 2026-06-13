import { getAppBaseUrl, getGoogleOAuthRedirectUri, getTwilioWebhookBaseUrl } from "./lib/appUrl.mjs";

const required = ["GOOGLE_OAUTH_CLIENT_ID", "GOOGLE_OAUTH_CLIENT_SECRET", "GOOGLE_TOKEN_ENCRYPTION_KEY"];

const missing = required.filter(key => !process.env[key]?.trim());

if (missing.length > 0) {
  console.error("Missing Google OAuth env vars:", missing.join(", "));
  process.exit(1);
}

if (!getAppBaseUrl(process.env).trim()) {
  console.error("Set APP_BASE_URL (e.g. http://localhost:3000 or https://your-domain.com)");
  process.exit(1);
}

const encryptionKey = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY ?? "";
if (!/^[0-9a-fA-F]{64}$/.test(encryptionKey)) {
  console.error("GOOGLE_TOKEN_ENCRYPTION_KEY must be 64 hex characters. Run: openssl rand -hex 32");
  process.exit(1);
}

console.log("Google OAuth env OK");
console.log("Redirect URI:", getGoogleOAuthRedirectUri(process.env));
