export const PULSE_WHAT_IS =
  "Pulse is an open protocol that accumulates weighted signals and emits a verifiable onchain event when a profile crosses its threshold.";

export const PULSE_EXPLORER_TOOL_NOTE =
  "Pulse Explorer is a developer tool for configuration, contract testing, and auditing — not the end-user app. Users live in consumer apps like Legacy Ledger.";

export const EXPLORER_SEARCH_LABEL = "Search a wallet address";

export const EXPLORER_HERO_CTA = "Enter a wallet address to view its Pulse profile.";

export const PROFILE_NOT_FOUND = (address: string) =>
  `No Pulse profile found for ${address}.`;

export const VIEWING_BANNER = (address: string) =>
  `Viewing ${address}. Connect this profile's wallet to enable owner actions.`;

export const CONNECT_TO_ACT_NOTE =
  "Connect the profile owner's wallet or a verified requestor wallet to enable actions.";

export const KEY_STORAGE_NOTE =
  "Your credentials are sent directly to the adapter service and stored encrypted on their end. Pulse never sees or stores them.";

export const WORLD_ID_CONFIG_CALLOUT =
  "These are the World ID actions your app must trigger for each Pulse function. Your users complete these verifications inside your app (for example Legacy Ledger).";

export const DEV_TEST_SECTION_TITLE = "Test with your own wallet — does not affect your users";

export const RECENT_SEARCHES_KEY = "pulse.explorer.recent";

export const WORLD_ID_INTEGRATED_KEY = "pulse.worldId.integrated";
