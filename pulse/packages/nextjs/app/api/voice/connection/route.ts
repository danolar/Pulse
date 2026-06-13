import { NextResponse } from "next/server";
import { isAddress } from "viem";
import {
  getTwilioVoiceEnv,
  getVoiceConnection,
  normalizePhoneNumber,
  revokeVoiceConnection,
  startOutgoingCallerIdValidation,
  upsertPendingVoiceConnection,
} from "~~/services/voice";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    getTwilioVoiceEnv();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Twilio voice is not configured.";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const profileOwner = searchParams.get("profileOwner");

  if (!profileOwner || !isAddress(profileOwner)) {
    return NextResponse.json({ error: "Missing or invalid profileOwner query param." }, { status: 400 });
  }

  try {
    return NextResponse.json(getVoiceConnection(profileOwner));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load voice connection.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    getTwilioVoiceEnv();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Twilio voice is not configured.";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  let body: { profileOwner?: string; phoneNumber?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const profileOwner = body.profileOwner;
  const phoneNumber = normalizePhoneNumber(body.phoneNumber ?? "");

  if (!profileOwner || !isAddress(profileOwner)) {
    return NextResponse.json({ error: "Missing or invalid profileOwner." }, { status: 400 });
  }

  if (!phoneNumber) {
    return NextResponse.json({ error: "Enter a valid phone number in E.164 format (e.g. +14155552671)." }, { status: 400 });
  }

  try {
    const validation = await startOutgoingCallerIdValidation(phoneNumber);
    const connection = upsertPendingVoiceConnection({
      profileOwnerAddress: profileOwner,
      phoneNumber,
      validationCode: validation.validationCode,
    });

    return NextResponse.json({
      ...connection,
      message:
        "Twilio is calling your phone now. When prompted, enter the validation code on your keypad, then click Check verification.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to start phone verification.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    getTwilioVoiceEnv();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Twilio voice is not configured.";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const profileOwner = searchParams.get("profileOwner");

  if (!profileOwner || !isAddress(profileOwner)) {
    return NextResponse.json({ error: "Missing or invalid profileOwner query param." }, { status: 400 });
  }

  try {
    const revoked = revokeVoiceConnection(profileOwner);
    return NextResponse.json({ revoked, profileOwnerAddress: profileOwner.toLowerCase() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to disconnect voice.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
