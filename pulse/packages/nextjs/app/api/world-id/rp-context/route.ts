import { NextResponse } from "next/server";
import { signRequest } from "@worldcoin/idkit/signing";

export async function POST(request: Request) {
  const signingKeyHex = process.env.WORLD_RP_SIGNING_KEY?.trim();
  const rpId = process.env.NEXT_PUBLIC_WORLD_RP_ID?.trim();

  if (!signingKeyHex || !rpId) {
    return NextResponse.json(
      {
        error:
          "Configure WORLD_RP_SIGNING_KEY (server) and NEXT_PUBLIC_WORLD_RP_ID in packages/nextjs/.env.local — see SETUP-EXTERNAL.md Phase 2.",
      },
      { status: 500 },
    );
  }

  let action = "";
  try {
    const body = (await request.json()) as { action?: string };
    action = body.action?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!action) {
    return NextResponse.json({ error: "action is required." }, { status: 400 });
  }

  if (signingKeyHex.startsWith("rp_")) {
    return NextResponse.json(
      {
        error:
          "WORLD_RP_SIGNING_KEY must be the RP signing key (hex private key from Developer Portal), not the RP ID. NEXT_PUBLIC_WORLD_RP_ID is already set separately.",
      },
      { status: 500 },
    );
  }

  let sig: string;
  let nonce: string;
  let createdAt: number;
  let expiresAt: number;

  try {
    ({ sig, nonce, createdAt, expiresAt } = signRequest({
      signingKeyHex,
      action,
      ttl: 300,
    }));
  } catch (error) {
    const detail = error instanceof Error ? error.message : "signRequest failed";
    return NextResponse.json(
      {
        error: `Invalid WORLD_RP_SIGNING_KEY: ${detail}. Copy the signing key from Developer Portal → Apps → your app → Relying Party — not the rp_ ID.`,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    rp_id: rpId,
    nonce,
    created_at: createdAt,
    expires_at: expiresAt,
    signature: sig,
  });
}
