import type { PulseVerificationModule } from "../types";

export const twilioVoiceModule: PulseVerificationModule = {
  id: "twilio-voice",
  name: "Voice agent",
  category: "active",
  status: "implemented",
  summary: "Random check-in calls — link your phone (verify in Twilio Console on trial) and enter the code when Pulse calls.",
  provider: "Twilio",
  signalDirection: "both",
  complements: ["world-id"],
  verificationType: "VOICE_AGENT",
  docsUrl: "https://www.twilio.com/docs/voice",
  setupKind: "integration",
};
