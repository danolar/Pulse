import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  decodeOAuthState,
  exchangeGoogleAuthCode,
  getGoogleOAuthEnv,
  upsertGoogleConnection,
} from "~~/services/google";

export const dynamic = "force-dynamic";

const OAUTH_VERIFIER_COOKIE = "google_oauth_verifier";
const OAUTH_STATE_COOKIE = "google_oauth_state";

const clearOAuthCookies = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(OAUTH_STATE_COOKIE);
  cookieStore.delete(OAUTH_VERIFIER_COOKIE);
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  if (oauthError) {
    await clearOAuthCookies();
    return NextResponse.redirect(new URL(`/setup?google=error&reason=${encodeURIComponent(oauthError)}`, request.url));
  }

  if (!code || !state) {
    return NextResponse.json({ error: "Missing OAuth code or state." }, { status: 400 });
  }

  try {
    getGoogleOAuthEnv();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Google OAuth is not configured.";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  const codeVerifier = cookieStore.get(OAUTH_VERIFIER_COOKIE)?.value;

  if (!storedState || storedState !== state || !codeVerifier) {
    return NextResponse.json({ error: "OAuth session expired or state mismatch." }, { status: 400 });
  }

  try {
    const statePayload = decodeOAuthState(state);
    const tokenResult = await exchangeGoogleAuthCode(code, codeVerifier);

    if (!tokenResult.refreshToken) {
      await clearOAuthCookies();
      return NextResponse.redirect(
        new URL("/setup?google=error&reason=missing_refresh_token", request.url),
      );
    }

    if (!tokenResult.googleSub) {
      return NextResponse.json({ error: "Google account id missing from userinfo." }, { status: 502 });
    }

    upsertGoogleConnection({
      profileOwnerAddress: statePayload.profileOwner,
      googleSub: tokenResult.googleSub,
      googleEmail: tokenResult.googleEmail,
      refreshToken: tokenResult.refreshToken,
      surfaces: statePayload.surfaces,
    });

    await clearOAuthCookies();

    return NextResponse.redirect(new URL("/setup?google=connected", request.url));
  } catch (error) {
    await clearOAuthCookies();
    const message = error instanceof Error ? error.message : "Google OAuth callback failed.";
    return NextResponse.redirect(new URL(`/setup?google=error&reason=${encodeURIComponent(message)}`, request.url));
  }
}
