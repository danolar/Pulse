import { getGoogleOAuthRedirectUri } from "~~/services/appUrl";
import type { GoogleSurfacesConfig } from "./types";
import { DEFAULT_GOOGLE_SURFACES } from "./types";

export const GOOGLE_OAUTH_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/drive.readonly",
] as const;

export type GoogleOAuthEnv = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  encryptionKeyHex: string;
};

export const getGoogleOAuthEnv = (): GoogleOAuthEnv => {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
  const redirectUri = getGoogleOAuthRedirectUri();
  const encryptionKeyHex = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY?.trim();

  if (!clientId || !clientSecret || !encryptionKeyHex) {
    throw new Error(
      "Missing Google OAuth env. Set GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, APP_BASE_URL (or GOOGLE_OAUTH_REDIRECT_URI), and GOOGLE_TOKEN_ENCRYPTION_KEY in .env.local",
    );
  }

  if (!/^[0-9a-fA-F]{64}$/.test(encryptionKeyHex)) {
    throw new Error("GOOGLE_TOKEN_ENCRYPTION_KEY must be 64 hex characters (32 bytes). Run: openssl rand -hex 32");
  }

  return { clientId, clientSecret, redirectUri, encryptionKeyHex };
};

export const parseSurfacesParam = (raw: string | null): GoogleSurfacesConfig => {
  if (!raw?.trim()) {
    return { ...DEFAULT_GOOGLE_SURFACES };
  }

  const enabled = new Set(
    raw
      .split(",")
      .map(value => value.trim())
      .filter(Boolean),
  );

  return {
    gmailSend: enabled.has("gmailSend") || enabled.has("gmail"),
    gmailReceive: enabled.has("gmailReceive") || enabled.has("gmail"),
    calendar: enabled.has("calendar"),
    drive: enabled.has("drive"),
  };
};

export const hasAnySurfaceEnabled = (surfaces: GoogleSurfacesConfig): boolean =>
  Object.values(surfaces).some(Boolean);
