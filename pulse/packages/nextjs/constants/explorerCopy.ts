export const PULSE_WHAT_IS =
  "Pulse is an open protocol that accumulates weighted signals and emits a verifiable onchain event when a profile crosses its threshold.";

export const PULSE_EXPLORER_TOOL_NOTE =
  "Pulse Explorer is a developer tool for configuration, contract testing, and auditing — not the end-user app. Users live in consumer apps like Legacy Ledger.";

export const EXPLORER_SEARCH_LABEL = "Search a wallet address";

export const EXPLORER_HERO_CTA = "Enter a wallet address to view its Pulse profile.";

export const CONFIGURATION_PAGE_TITLE = "Pulse configuration";

export const CONFIGURATION_PAGE_SUBTITLE =
  "Identity, signal sources, and monitoring rhythm — configure your dev profile step by step.";

export const REQUESTORS_CONFIG_CALLOUT =
  "Trusted requestors are authorized per end-user profile inside your consumer app (for example Legacy Ledger), not globally in Explorer. Your app calls authorizeRequestor for specific wallets tied to that user's profile, then each requestor claims their slot with World ID.";

export const PROFILE_NOT_FOUND = (address: string) =>
  `No Pulse profile found for ${address}.`;

export const VIEWING_BANNER =
  "Read-only profile view. Verification and owner actions run in the consumer app, not Explorer.";

export const EXPLORER_BROWSE_NOTE =
  "Explorer shows onchain protocol state for audit. It is not where owners or requestors act.";

export const SIGNAL_ACTIVITY_TITLE = "Signal activity";

export const SIGNAL_ACTIVITY_NOTE =
  "Weighted evidence from authorized adapters and attempt outcomes accumulates toward threshold. Multiple sources can report in parallel during the same window — this is what drives the gauge above.";

export const WINDOW_SCHEDULE_TITLE = "Scheduled checks (this window)";

export const WINDOW_SCHEDULE_NOTE =
  "Separate from passive signals: the protocol commits a random sequence of owner response windows (commit-reveal). Adapters keep reporting in the background; at most one scheduled check typically expects an owner response at a given time.";

export const WINDOW_SCHEDULE_FOOTNOTE =
  "Owners respond to scheduled checks in their consumer app. Explorer shows both layers read-only for audit.";

export const REQUESTOR_ACTIONS_NOTE =
  "Verified requestor actions for this profile. Requestors are authorized per user in the consumer app.";

export const KEY_STORAGE_NOTE =
  "Your credentials are sent directly to the adapter service and stored encrypted on their end. Pulse never sees or stores them.";

export const WORLD_ID_CONFIG_CALLOUT =
  "These are the World ID actions your app must trigger for each Pulse function. Your users complete these verifications inside your app (for example Legacy Ledger).";

export const DEV_TEST_SECTION_TITLE = "Test with your own wallet — does not affect your users";

export const RECENT_SEARCHES_KEY = "pulse.explorer.recent";

export const WORLD_ID_INTEGRATED_KEY = "pulse.worldId.integrated";
