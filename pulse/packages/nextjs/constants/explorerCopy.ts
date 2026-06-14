export const PULSE_WHAT_IS =
  "Pulse accumulates weighted signals onchain and emits a verifiable event when a profile crosses its threshold.";

export const PULSE_EXPLORER_TOOL_NOTE =
  "Search any address to see public oracle results. Signal detail stays in the integrating app's dashboard.";

export const EXPLORER_SEARCH_LABEL = "Search a wallet address";

export const EXPLORER_HERO_CTA = "Search a wallet address to view Pulse activity.";

export const CONFIGURATION_PAGE_TITLE = "Setup";

export const CONFIGURATION_PAGE_SUBTITLE =
  "Signal sources, World ID actions, monitoring rhythm, and randomness for your integration.";

export const REQUESTORS_CONFIG_CALLOUT =
  "Authorize requestors per profile in your app. Each requestor claims their slot with World ID.";

export const PROFILE_NOT_FOUND = (address: string) =>
  `No Pulse activity found for ${address}.`;

export const VIEWING_BANNER =
  "Read-only view. Owner and requestor actions run in the integrating app.";

export const EXPLORER_BROWSE_NOTE =
  "Public oracle results: lifecycle state, threshold events, and signal timing. Weights and signal content stay private.";

export const PUBLIC_VIEW_NOTE =
  "Weights and configuration are visible only to the integrating app.";

export const SIGNAL_ACTIVITY_TITLE = "Signal activity";

export const SIGNAL_ACTIVITY_NOTE =
  "Authorized adapters report during each monitoring window. Outcomes accumulate toward threshold.";

export const WINDOW_SCHEDULE_TITLE = "Scheduled checks";

export const WINDOW_SCHEDULE_NOTE =
  "Verification windows are committed onchain before reveal. Adapters may continue reporting in parallel.";

export const WINDOW_SCHEDULE_FOOTNOTE = "Respond to open checks in your app.";

export const REQUESTOR_ACTIONS_NOTE = "Actions for authorized requestors on this profile.";

export const KEY_STORAGE_NOTE =
  "Credentials are sent directly to the adapter service. Pulse never stores them.";

export const WORLD_ID_CONFIG_CALLOUT =
  "Use these action strings in your World ID integration. Users verify inside your app.";

export const DEV_TEST_SECTION_TITLE = "Test with your wallet";

export const RECENT_SEARCHES_KEY = "pulse.explorer.recent";

export const WORLD_ID_INTEGRATED_KEY = "pulse.worldId.integrated";

export const DASHBOARD_PRIVATE_NOTE =
  "Weight progress, decoded signals, and configuration for profiles you integrate.";
