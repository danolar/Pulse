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

  const { sig, nonce, createdAt, expiresAt } = signRequest({
    signingKeyHex,
    action,
    ttl: 300,
  });

  return NextResponse.json({
    rp_id: rpId,
    nonce,
    created_at: createdAt,
    expires_at: expiresAt,
    signature: sig,
  });
}
