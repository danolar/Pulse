import { NextResponse } from "next/server";
import {
  buildResultTwiml,
  completeCallAttempt,
  getCallAttempt,
  requireWebhookBaseUrl,
  validateTwilioRequest,
} from "~~/services/voice";

export const dynamic = "force-dynamic";

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

  if (!attemptId) {
    return new NextResponse("Missing attemptId", { status: 400 });
  }

  const formData = await request.formData();
  const params = formDataToRecord(formData);
  const signature = request.headers.get("x-twilio-signature");
  const url = `${requireWebhookBaseUrl()}/api/voice/gather?attemptId=${encodeURIComponent(attemptId)}`;

  if (!validateTwilioRequest(url, params, signature)) {
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

  completeCallAttempt({ attemptId, outcome: "failure", status: "failed" });
  return new NextResponse(buildResultTwiml("That code was incorrect. Goodbye."), {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}
