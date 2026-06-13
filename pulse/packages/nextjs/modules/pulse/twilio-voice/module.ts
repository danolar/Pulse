import type { PulseVerificationModule } from "../types";

export const twilioVoiceModule: PulseVerificationModule = {
  id: "twilio-voice",
  name: "Voice agent",
  category: "active",
  status: "implemented",
  summary: "Voice check-in adapter signer — authorize the adapter address here; users link phone numbers inside consumer apps.",
  provider: "Twilio",
  signalDirection: "both",
  complements: ["world-id"],
  verificationType: "VOICE_AGENT",
  docsUrl: "https://www.twilio.com/docs/voice",
  setupKind: "adapter",
};
