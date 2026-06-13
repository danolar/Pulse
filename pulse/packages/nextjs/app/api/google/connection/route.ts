import { NextResponse } from "next/server";
import { isAddress } from "viem";
import {
  getActiveGoogleConnection,
  getDecryptedRefreshToken,
  getGoogleOAuthEnv,
  revokeGoogleConnection,
  revokeGoogleRefreshToken,
} from "~~/services/google";

export const dynamic = "force-dynamic";

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

  try {
    const connection = getActiveGoogleConnection(profileOwner);

    if (!connection) {
      return NextResponse.json({ connected: false, profileOwnerAddress: profileOwner.toLowerCase() });
    }

    return NextResponse.json(connection);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load Google connection.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
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

  try {
    const refreshToken = getDecryptedRefreshToken(profileOwner);

    if (refreshToken) {
      try {
        await revokeGoogleRefreshToken(refreshToken);
      } catch {
        // Local disconnect still proceeds if Google revoke fails.
      }
    }

    const revoked = revokeGoogleConnection(profileOwner);

    return NextResponse.json({ revoked, profileOwnerAddress: profileOwner.toLowerCase() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to revoke Google connection.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
