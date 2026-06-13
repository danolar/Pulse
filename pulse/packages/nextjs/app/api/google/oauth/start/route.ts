import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isAddress } from "viem";
import {
  buildGoogleAuthStart,
  getGoogleOAuthEnv,
  hasAnySurfaceEnabled,
  parseSurfacesParam,
} from "~~/services/google";

export const dynamic = "force-dynamic";

const OAUTH_VERIFIER_COOKIE = "google_oauth_verifier";
const OAUTH_STATE_COOKIE = "google_oauth_state";
const OAUTH_COOKIE_MAX_AGE = 60 * 10;

const setOAuthCookies = async (state: string, codeVerifier: string) => {
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";

  cookieStore.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: OAUTH_COOKIE_MAX_AGE,
    path: "/",
  });

  cookieStore.set(OAUTH_VERIFIER_COOKIE, codeVerifier, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: OAUTH_COOKIE_MAX_AGE,
    path: "/",
  });
};

export async function GET(request: Request) {
  try {
    getGoogleOAuthEnv();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Google OAuth is not configured.";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const profileOwner = searchParams.get("profileOwner");

  if (!profileOwner || !isAddress(profileOwner)) {
    return NextResponse.json({ error: "Missing or invalid profileOwner query param." }, { status: 400 });
  }

  const surfaces = parseSurfacesParam(searchParams.get("surfaces"));
  if (!hasAnySurfaceEnabled(surfaces)) {
    return NextResponse.json({ error: "At least one Google surface must be enabled." }, { status: 400 });
  }

  try {
    const { authUrl, state, codeVerifier } = buildGoogleAuthStart(profileOwner, surfaces);
    await setOAuthCookies(state, codeVerifier);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to start Google OAuth.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
