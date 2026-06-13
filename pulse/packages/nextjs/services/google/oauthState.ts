import type { OAuthStatePayload } from "./types";

export const encodeOAuthState = (payload: OAuthStatePayload): string =>
  Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");

export const decodeOAuthState = (state: string): OAuthStatePayload => {
  const parsed = JSON.parse(Buffer.from(state, "base64url").toString("utf8")) as OAuthStatePayload;

  if (!parsed?.nonce || !parsed?.profileOwner || !parsed?.surfaces) {
    throw new Error("Invalid OAuth state payload.");
  }

  return parsed;
};
