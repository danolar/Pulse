import { createHash, randomBytes } from "node:crypto";
import { google } from "googleapis";
import { GOOGLE_OAUTH_SCOPES, getGoogleOAuthEnv } from "./config";
import { encodeOAuthState } from "./oauthState";
import type { GoogleSurfacesConfig, OAuthStatePayload } from "./types";

export type GoogleAuthStartResult = {
  authUrl: string;
  state: string;
  codeVerifier: string;
};

export const createGoogleOAuthClient = () => {
  const { clientId, clientSecret, redirectUri } = getGoogleOAuthEnv();
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

export const createPkcePair = (): { codeVerifier: string; codeChallenge: string } => {
  const codeVerifier = randomBytes(32).toString("base64url");
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
  return { codeVerifier, codeChallenge };
};

export const buildGoogleAuthStart = (
  profileOwner: string,
  surfaces: GoogleSurfacesConfig,
): GoogleAuthStartResult => {
  const oauth2Client = createGoogleOAuthClient();
  const { codeVerifier, codeChallenge } = createPkcePair();

  const statePayload: OAuthStatePayload = {
    nonce: randomBytes(16).toString("hex"),
    profileOwner: profileOwner.toLowerCase(),
    surfaces,
  };

  const state = encodeOAuthState(statePayload);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [...GOOGLE_OAUTH_SCOPES],
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  } as Parameters<typeof oauth2Client.generateAuthUrl>[0]);

  return { authUrl, state, codeVerifier };
};

export type GoogleTokenExchangeResult = {
  refreshToken: string | null;
  accessToken: string | null;
  googleSub: string;
  googleEmail: string | null;
};

export const exchangeGoogleAuthCode = async (
  code: string,
  codeVerifier: string,
): Promise<GoogleTokenExchangeResult> => {
  const oauth2Client = createGoogleOAuthClient();

  const { tokens } = await oauth2Client.getToken({
    code,
    codeVerifier,
  });

  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
  const { data } = await oauth2.userinfo.get();

  return {
    refreshToken: tokens.refresh_token ?? null,
    accessToken: tokens.access_token ?? null,
    googleSub: data.id ?? "",
    googleEmail: data.email ?? null,
  };
};

export const revokeGoogleRefreshToken = async (refreshToken: string): Promise<void> => {
  const oauth2Client = createGoogleOAuthClient();
  await oauth2Client.revokeToken(refreshToken);
};
