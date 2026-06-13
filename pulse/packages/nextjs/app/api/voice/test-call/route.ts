import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { getTwilioVoiceEnv, initiateOutboundCall } from "~~/services/voice";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    getTwilioVoiceEnv();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Twilio voice is not configured.";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  let body: { profileOwner?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const profileOwner = body.profileOwner;
  if (!profileOwner || !isAddress(profileOwner)) {
    return NextResponse.json({ error: "Missing or invalid profileOwner." }, { status: 400 });
  }

  try {
    const result = await initiateOutboundCall({ profileOwnerAddress: profileOwner, kind: "test" });
    return NextResponse.json({
      ...result,
      message: "Calling your linked phone now. Enter the check-in code on your keypad when prompted.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to place test call.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
