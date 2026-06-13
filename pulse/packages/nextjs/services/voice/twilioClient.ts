import twilio from "twilio";
import { getTwilioVoiceEnv } from "./config";

export const getTwilioClient = () => {
  const { accountSid, authToken } = getTwilioVoiceEnv();
  return twilio(accountSid, authToken);
};

export const validateTwilioRequest = (url: string, params: Record<string, string>, signature: string | null): boolean => {
  if (!signature) return false;
  const { authToken } = getTwilioVoiceEnv();
  return twilio.validateRequest(authToken, signature, url, params);
};

export const startOutgoingCallerIdValidation = async (phoneNumber: string) => {
  const client = getTwilioClient();
  const result = await client.validationRequests.create({
    friendlyName: "Pulse voice check-in",
    phoneNumber,
  });

  return {
    validationCode: result.validationCode,
    callSid: result.callSid,
    phoneNumber: result.phoneNumber,
  };
};

export const isPhoneVerifiedOnTwilio = async (phoneNumber: string): Promise<boolean> => {
  const client = getTwilioClient();
  const matches = await client.outgoingCallerIds.list({ phoneNumber, limit: 20 });
  return matches.some(entry => entry.phoneNumber === phoneNumber);
};
