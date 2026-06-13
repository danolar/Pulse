import { NextResponse } from "next/server";
import { buildGatherTwiml, getAttemptIntroMessage } from "~~/services/voice";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const attemptId = searchParams.get("attemptId");

  if (!attemptId) {
    return new NextResponse("Missing attemptId", { status: 400 });
  }

  const twiml = buildGatherTwiml(attemptId, getAttemptIntroMessage(), 0);
  return new NextResponse(twiml, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

export async function POST(request: Request) {
  return GET(request);
}
