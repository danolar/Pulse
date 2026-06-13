import { worldIdActions } from "~~/constants/pulseProtocol";

export const CONNECTION_KIT_PANEL_TITLE = "Connect your app to Pulse";

export const CONNECTION_KIT_PANEL_INTRO =
  "Your app talks to Pulse through one contract and one World ID app_id. Users sign with their own wallet; you read state by their address. No registration handshake.";

export const CONNECTION_KIT_DEPLOYMENT_NOTE =
  "These are the values for the official Pulse deployment. If you deploy your own Pulse instance, replace the contract address and the app_id with your own; everything else below is identical.";

export const CONNECTION_KIT_CONSUME_EXTEND_NOTE =
  "Most integrations consume Pulse (read state, react to outcomes — steps 1–5 below). To extend Pulse by authoring a signal adapter, see the adapter guide linked at the bottom.";

/** World ID action string convention — templates use {address} / {owner} / {requestor} placeholders. */
export const WORLD_ID_ACTION_PATTERNS = [
  { flow: "Create profile", pattern: worldIdActions.createProfile("{address}"), level: "device" },
  { flow: "Bind Orb", pattern: worldIdActions.bindOrb("{address}"), level: "orb" },
  { flow: "Check in", pattern: worldIdActions.checkin("{address}"), level: "device" },
  { flow: "Request extension", pattern: worldIdActions.requestExtension("{address}"), level: "device" },
  { flow: "Freeze evaluation", pattern: worldIdActions.block("{address}"), level: "orb" },
  { flow: "Reverse alarm", pattern: worldIdActions.resurrect("{address}"), level: "orb" },
  {
    flow: "Claim requestor slot",
    pattern: worldIdActions.claimRequestorSlot("{owner}", "{requestor}"),
    level: "device",
  },
  { flow: "Request evaluation", pattern: worldIdActions.requestEvaluation("{owner}"), level: "device" },
] as const;

export const CONNECTION_KIT_INTEGRATION_STEPS = [
  {
    title: "Use Pulse's World ID app_id in your World setup",
    explanation:
      "Embed the same World ID app_id Pulse uses so proofs your users generate verify against the Pulse contract.",
    snippetKey: "appId" as const,
  },
  {
    title: "Configure IDKit per action",
    explanation:
      "Each gated function expects a proof for a specific action string and verification level (device or orb).",
    snippetKey: "idKit" as const,
    includeActionTable: true,
  },
  {
    title: "Call the matching contract function with the proof",
    explanation: "Pass the proof returned by IDKit into the corresponding PulseOracle write.",
    snippetKey: "checkinWrite" as const,
  },
  {
    title: "Read profile state by your user's address",
    explanation:
      "A profile is keyed by the owner's wallet address. Read state directly — no per-app registration.",
    snippetKey: "profilesRead" as const,
  },
  {
    title: "React to outcomes",
    explanation:
      "Listen for ThresholdReached on your users' addresses, or implement IThresholdConsumer and set your contract as the profile notification target.",
    snippetKey: "outcomes" as const,
  },
] as const;

export const buildConnectionKitSnippets = (params: {
  appId: string;
  contractAddress: string;
}) => {
  const { appId, contractAddress } = params;
  const appIdValue = appId || "app_...";
  const contract = contractAddress || "0x...";

  return {
    appId: `export const PULSE_WORLD_APP_ID = "${appIdValue}";`,
    idKit: `<IDKitWidget
  app_id="${appIdValue}"
  action="${worldIdActions.checkin("{userAddress}")}"
  signal="{userAddress}"
  verification_level="device"
  onSuccess={async (proof) => {
    // pass proof to PulseOracle (step 3)
  }}
/>`,
    checkinWrite: `await pulseOracle.write.checkin([
  proof.root,
  proof.nullifier_hash,
  proof.proof,
]);`,
    profilesRead: `const profile = await pulseOracle.read.profiles([userAddress]);
// profile.exists, profile.lifecycle (state), profile.accumulatedWeight,
// profile.threshold, profile.epoch — plus orbBound when exposed by your deployment`,
    outcomes: `// Push: implement IThresholdConsumer
interface IThresholdConsumer {
  function onThresholdReached(address profileOwner, string calldata auditBlobId) external;
}

// Pull: watch ThresholdReached(profileOwner indexed, epoch, auditBlobId)
// event ThresholdReached(address indexed profileOwner, uint64 epoch, string auditBlobId)

// Set notificationTarget on the profile to receive the push callback`,
  };
};

export const CONNECTION_KIT_DOC_LINKS = [
  { label: "Repository & README", href: "https://github.com/danolar/Pulse" },
  {
    label: "PulseOracle ABI",
    href: "https://github.com/danolar/Pulse/tree/main/pulse/packages/nextjs/contracts",
  },
  {
    label: "Adapter authoring guide",
    href: "https://github.com/danolar/Pulse/blob/main/pulse/packages/nextjs/modules/pulse/README.md",
  },
] as const;
