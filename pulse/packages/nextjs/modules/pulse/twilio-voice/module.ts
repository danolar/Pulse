import type { PulseVerificationModule } from "../types";

export const twilioVoiceModule: PulseVerificationModule = {
  id: "twilio-voice",
  name: "Voice agent",
  category: "active",
  status: "implemented",
  summary: "Voice check-in signals. Users link phone numbers in your app.",
  provider: "Twilio",
  signalDirection: "both",
  complements: ["world-id"],
  verificationType: "VOICE_AGENT",
  docsUrl: "https://www.twilio.com/docs/voice",
  adapterLabel: "VOICE_AGENT",
  suggestedWeight: 12,
  setupKind: "adapter",
};
