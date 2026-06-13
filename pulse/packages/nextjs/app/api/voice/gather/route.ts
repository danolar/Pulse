import { NextResponse } from "next/server";
import {
  buildGatherTwiml,
  buildResultTwiml,
  completeCallAttempt,
  getCallAttempt,
  getTwilioWebhookUrl,
  shouldValidateTwilioWebhooks,
  validateTwilioRequest,
} from "~~/services/voice";

export const dynamic = "force-dynamic";

const MAX_GATHER_TRIES = 3;

const formDataToRecord = (formData: FormData): Record<string, string> => {
  const params: Record<string, string> = {};
  formData.forEach((value, key) => {
    params[key] = String(value);
  });
  return params;
};

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const attemptId = searchParams.get("attemptId");
  const tries = Number(searchParams.get("tries") ?? "0");

  if (!attemptId) {
    return new NextResponse("Missing attemptId", { status: 400 });
  }

  const formData = await request.formData();
  const params = formDataToRecord(formData);
  const signature = request.headers.get("x-twilio-signature");
  const url = getTwilioWebhookUrl(request);

  if (shouldValidateTwilioWebhooks() && !validateTwilioRequest(url, params, signature)) {
    return new NextResponse("Invalid Twilio signature", { status: 403 });
  }

  const attempt = getCallAttempt(attemptId);
  if (!attempt) {
    return new NextResponse(buildResultTwiml("This check-in session has expired. Goodbye."), {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }

  const digits = params.Digits?.trim() ?? "";
  if (digits === attempt.checkInCode) {
    completeCallAttempt({ attemptId, outcome: "success", status: "completed" });
    return new NextResponse(buildResultTwiml("Check-in verified. Thank you."), {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }

  if (tries + 1 >= MAX_GATHER_TRIES) {
    completeCallAttempt({ attemptId, outcome: "failure", status: "failed" });
    return new NextResponse(buildResultTwiml("That code was incorrect. Goodbye."), {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }

  const retryMessage = digits
    ? "That code was incorrect. Enter the four digit code from your screen, then press pound."
    : "No code received. Enter the four digit code from your screen, then press pound.";

  return new NextResponse(buildGatherTwiml(attemptId, retryMessage, tries + 1), {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

export async function GET(request: Request) {
  return POST(request);
}
