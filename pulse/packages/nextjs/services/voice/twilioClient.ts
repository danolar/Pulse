import twilio from "twilio";
import { getTwilioVoiceEnv } from "./config";
import { normalizePhoneNumber } from "./phone";

export const TWILIO_VERIFIED_CALLER_IDS_URL =
  "https://console.twilio.com/us1/develop/phone-numbers/manage/verified";

export const getTwilioClient = () => {
  const { accountSid, authToken } = getTwilioVoiceEnv();
  return twilio(accountSid, authToken);
};

export const validateTwilioRequest = (
  url: string,
  params: Record<string, string>,
  signature: string | null,
): boolean => {
  if (!signature) return false;
  const { authToken } = getTwilioVoiceEnv();
  return twilio.validateRequest(authToken, signature, url, params);
};

export async function isPhoneVerifiedOnTwilio(phoneNumber: string): Promise<boolean> {
  const client = getTwilioClient();
  const normalized = normalizePhoneNumber(phoneNumber) ?? phoneNumber;

  const filtered = await client.outgoingCallerIds.list({ phoneNumber: normalized, limit: 20 });
  if (filtered.some(entry => normalizePhoneNumber(entry.phoneNumber ?? "") === normalized)) {
    return true;
  }

  const all = await client.outgoingCallerIds.list({ limit: 50 });
  return all.some(entry => normalizePhoneNumber(entry.phoneNumber ?? "") === normalized);
}
