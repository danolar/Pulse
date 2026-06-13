import type { PulseVerificationModule } from "../types";

export const elevenlabsVoiceModule: PulseVerificationModule = {
  id: "elevenlabs-voice",
  name: "Voice agent",
  category: "active",
  status: "planned",
  summary: "When a check-in opens, a voice agent calls you with security questions.",
  provider: "ElevenLabs",
  signalDirection: "both",
  complements: ["world-id"],
  verificationType: "VOICE_AGENT",
  docsUrl: "https://elevenlabs.io/docs",
  setupKind: "integration",
};
