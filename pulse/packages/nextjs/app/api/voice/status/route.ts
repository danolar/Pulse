import { NextResponse } from "next/server";
import {
  completeCallAttempt,
  getCallAttempt,
  getTwilioWebhookUrl,
  shouldValidateTwilioWebhooks,
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

const mapStatusToOutcome = (
  callStatus: string,
): { outcome: "success" | "failure" | "no_answer"; status: "completed" | "failed" | "missed" } => {
  if (callStatus === "completed") {
    return { outcome: "failure", status: "completed" };
  }
  if (callStatus === "busy" || callStatus === "failed" || callStatus === "canceled") {
    return { outcome: "failure", status: "failed" };
  }
  return { outcome: "no_answer", status: "missed" };
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
  const url = getTwilioWebhookUrl(request);

  if (shouldValidateTwilioWebhooks() && !validateTwilioRequest(url, params, signature)) {
    return new NextResponse("Invalid Twilio signature", { status: 403 });
  }

  const attempt = getCallAttempt(attemptId);
  if (!attempt || attempt.completedAt) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const callStatus = params.CallStatus ?? "";
  if (callStatus === "completed" && attempt.outcome === "success") {
    return NextResponse.json({ ok: true });
  }

  if (["completed", "busy", "failed", "no-answer", "canceled"].includes(callStatus)) {
    if (attempt.outcome === "success") {
      return NextResponse.json({ ok: true });
    }
    const mapped = mapStatusToOutcome(callStatus);
    completeCallAttempt({ attemptId, ...mapped });
  }

  return NextResponse.json({ ok: true });
}
