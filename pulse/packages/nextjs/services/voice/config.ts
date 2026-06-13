export type TwilioVoiceEnv = {
  accountSid: string;
  authToken: string;
  fromNumber: string;
  webhookBaseUrl: string | null;
  encryptionKeyHex: string;
  callsEnabled: boolean;
  maxCallsPerDay: number;
};

export const getTwilioVoiceEnv = (): TwilioVoiceEnv => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const fromNumber = process.env.TWILIO_FROM_NUMBER?.trim();
  const webhookBaseUrl = process.env.TWILIO_WEBHOOK_BASE_URL?.trim() || null;
  const encryptionKeyHex =
    process.env.VOICE_TOKEN_ENCRYPTION_KEY?.trim() || process.env.GOOGLE_TOKEN_ENCRYPTION_KEY?.trim();
  const callsEnabled = process.env.VOICE_CALLS_ENABLED?.trim().toLowerCase() === "true";
  const maxCallsPerDay = Number(process.env.VOICE_MAX_CALLS_PER_DAY ?? "3");

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error(
      "Missing Twilio env. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER in .env.local",
    );
  }

  if (!encryptionKeyHex || !/^[0-9a-fA-F]{64}$/.test(encryptionKeyHex)) {
    throw new Error(
      "VOICE_TOKEN_ENCRYPTION_KEY (or GOOGLE_TOKEN_ENCRYPTION_KEY) must be 64 hex characters. Run: openssl rand -hex 32",
    );
  }

  return {
    accountSid,
    authToken,
    fromNumber,
    webhookBaseUrl,
    encryptionKeyHex,
    callsEnabled,
    maxCallsPerDay: Number.isFinite(maxCallsPerDay) && maxCallsPerDay > 0 ? maxCallsPerDay : 3,
  };
};

export const isVoiceCallsEnabled = (): boolean => {
  try {
    return getTwilioVoiceEnv().callsEnabled;
  } catch {
    return false;
  }
};

export const requireWebhookBaseUrl = (): string => {
  const { webhookBaseUrl } = getTwilioVoiceEnv();
  if (!webhookBaseUrl) {
    throw new Error("TWILIO_WEBHOOK_BASE_URL is required for outbound calls (use ngrok or similar in dev).");
  }
  return webhookBaseUrl.replace(/\/$/, "");
};
