import { NextResponse } from "next/server";
import { isAddress } from "viem";
import {
  getPendingPhoneNumber,
  getTwilioVoiceEnv,
  getVoiceConnection,
  isPhoneVerifiedOnTwilio,
  markVoiceConnectionVerified,
} from "~~/services/voice";

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

  const pendingPhone = getPendingPhoneNumber(profileOwner);
  if (!pendingPhone) {
    return NextResponse.json({ error: "No pending phone link. Save your phone number first." }, { status: 400 });
  }

  try {
    const verified = await isPhoneVerifiedOnTwilio(pendingPhone);
    if (!verified) {
      return NextResponse.json({
        verified: false,
        message:
          "Not verified yet. In Twilio Console → Verified Caller IDs, add this exact number and complete Twilio's verification, then try again.",
      });
    }

    const connection = markVoiceConnectionVerified(profileOwner);
    return NextResponse.json({ verified: true, ...connection });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to check verification status.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
