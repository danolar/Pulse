import twilio from "twilio";
import { requireWebhookBaseUrl } from "./config";
import { attachCallSid, createCallAttempt, countCallsToday } from "./callStore";
import { getVerifiedPhoneNumber } from "./connectionStore";
import { generateCheckInCode } from "./phone";
import { getTwilioClient } from "./twilioClient";
import { getTwilioVoiceEnv } from "./config";

const VoiceResponse = twilio.twiml.VoiceResponse;

export const buildGatherTwiml = (attemptId: string, message: string, tries = 0): string => {
  const baseUrl = requireWebhookBaseUrl();
  const response = new VoiceResponse();
  const gather = response.gather({
    numDigits: 4,
    action: `${baseUrl}/api/voice/gather?attemptId=${encodeURIComponent(attemptId)}&tries=${tries}`,
    method: "POST",
    timeout: 30,
    finishOnKey: "#",
  });
  gather.say({ voice: "Polly.Joanna" }, message);
  return response.toString();
};

export const buildResultTwiml = (message: string): string => {
  const response = new VoiceResponse();
  response.say({ voice: "Polly.Joanna" }, message);
  response.hangup();
  return response.toString();
};

export const initiateOutboundCall = async (input: {
  profileOwnerAddress: string;
  kind: "test" | "scheduled";
}): Promise<{ attemptId: string; checkInCode: string; callSid: string }> => {
  const env = getTwilioVoiceEnv();
  const phone = getVerifiedPhoneNumber(input.profileOwnerAddress);

  if (!phone) {
    throw new Error("Link and verify your phone in Voice agent setup first.");
  }

  if (!env.callsEnabled) {
    throw new Error("Voice calls are disabled. Set VOICE_CALLS_ENABLED=true in .env.local.");
  }

  if (env.maxCallsPerDay > 0 && countCallsToday(input.profileOwnerAddress) >= env.maxCallsPerDay) {
    throw new Error(`Daily call limit reached (${env.maxCallsPerDay} calls per day). Set VOICE_MAX_CALLS_PER_DAY higher in .env.local.`);
  }

  const checkInCode = generateCheckInCode();
  const attempt = createCallAttempt({
    profileOwnerAddress: input.profileOwnerAddress,
    checkInCode,
    kind: input.kind,
  });

  const baseUrl = requireWebhookBaseUrl();
  const client = getTwilioClient();

  const call = await client.calls.create({
    to: phone,
    from: env.fromNumber,
    url: `${baseUrl}/api/voice/twiml?attemptId=${encodeURIComponent(attempt.id)}`,
    statusCallback: `${baseUrl}/api/voice/status?attemptId=${encodeURIComponent(attempt.id)}`,
    statusCallbackMethod: "POST",
    statusCallbackEvent: ["completed", "busy", "failed", "no-answer", "canceled"],
  });

  attachCallSid(attempt.id, call.sid);

  return { attemptId: attempt.id, checkInCode, callSid: call.sid };
};

export const getAttemptIntroMessage = (): string =>
  "This is Pulse. Enter the four digit code from your screen, then press pound.";
