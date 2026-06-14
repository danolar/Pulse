export const PULSE_WHAT_IS =
  "Pulse is a configurable onchain attestation oracle: it accumulates weighted signals and emits a verifiable event when a profile crosses its threshold.";

export const PULSE_EXPLORER_TOOL_NOTE =
  "Pulse Explorer is the public audit surface — oracle results, lifecycle state, and evidence that signals occurred. Progress toward threshold (weights, direction, configuration) is visible only in the consumer dashboard.";

export const EXPLORER_SEARCH_LABEL = "Search a wallet address";

export const EXPLORER_HERO_CTA = "Enter a wallet address to see its Pulse oracle activity.";

export const CONFIGURATION_PAGE_TITLE = "Profile setup";

export const CONFIGURATION_PAGE_SUBTITLE =
  "Signals, identity, and monitoring rhythm — create a profile for profileId = keccak256(owner, your wallet).";

export const REQUESTORS_CONFIG_CALLOUT =
  "Trusted requestors are authorized per end-user profile inside your consumer app (for example Legacy Ledger), not globally in Explorer. Your app calls authorizeRequestor for specific wallets tied to that user's profile, then each requestor claims their slot with World ID.";

export const PROFILE_NOT_FOUND = (address: string) =>
  `No public Pulse oracle activity found for ${address}.`;

export const VIEWING_BANNER =
  "Read-only profile view. Verification and owner actions run in the consumer app, not Explorer.";

export const EXPLORER_BROWSE_NOTE =
  "Public Explorer shows oracle results (lifecycle state, threshold events, signal timing) — the same class of data you'd expect on Etherscan. Accumulated weight, signal direction, and threshold values stay private to each consumer.";

export const PUBLIC_VIEW_NOTE =
  "This view shows public oracle results and activity for this address. Accumulated weights, signal details, and configuration are visible only to the consumer who configured each profile.";

export const SIGNAL_ACTIVITY_TITLE = "Signal activity";

export const SIGNAL_ACTIVITY_NOTE =
  "Weighted evidence from authorized adapters and attempt outcomes accumulates toward threshold. Multiple sources can report in parallel during the same window — this is what drives the gauge above.";

export const WINDOW_SCHEDULE_TITLE = "Scheduled checks (this window)";

export const WINDOW_SCHEDULE_NOTE =
  "Separate from passive signals: the protocol commits a random sequence of owner response windows (commit-reveal). Adapters keep reporting in the background; at most one scheduled check typically expects an owner response at a given time.";

export const WINDOW_SCHEDULE_FOOTNOTE =
  "Owners respond to scheduled checks in their consumer app. The public Explorer never shows decoded schedule state.";

export const REQUESTOR_ACTIONS_NOTE =
  "Verified requestor actions for this profile. Requestors are authorized per user in the consumer app.";

export const KEY_STORAGE_NOTE =
  "Your credentials are sent directly to the adapter service and stored encrypted on their end. Pulse never sees or stores them.";

export const WORLD_ID_CONFIG_CALLOUT =
  "These are the World ID actions your app must trigger for each Pulse function. Your users complete these verifications inside your app (for example Legacy Ledger).";

export const DEV_TEST_SECTION_TITLE = "Test with your own wallet — does not affect your users";

export const RECENT_SEARCHES_KEY = "pulse.explorer.recent";

export const WORLD_ID_INTEGRATED_KEY = "pulse.worldId.integrated";

export const DASHBOARD_PRIVATE_NOTE =
  "Private consumer view — accumulated weight, decoded signals, and configuration appear here only.";
