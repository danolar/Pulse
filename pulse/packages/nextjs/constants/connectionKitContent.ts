import { worldIdActions } from "~~/constants/pulseProtocol";

export const CONNECTION_KIT_PANEL_TITLE = "Connect your app to Pulse";

export const CONNECTION_KIT_PANEL_INTRO =
  "Your consumer app (for example Legacy Ledger) integrates via profileId = keccak256(ownerAddress, consumerAddress). Users sign with their own wallet; you read decoded state in your dashboard context.";

export const CONNECTION_KIT_DEPLOYMENT_NOTE =
  "These are the values for the official Pulse deployment. If you deploy your own Pulse instance, replace the contract address and the app_id with your own; everything else below is identical.";

export const CONNECTION_KIT_CONSUME_EXTEND_NOTE =
  "Most integrations consume Pulse (read state, react to outcomes — steps 1–5 below). To extend Pulse by authoring a signal adapter, see the adapter guide linked at the bottom.";

/** World ID action strings — owner address in create/checkin flows; profile keyed by profileId onchain (future). */
export const WORLD_ID_ACTION_PATTERNS = [
  { flow: "Create profile", pattern: worldIdActions.createProfile("{ownerAddress}"), level: "device" },
  { flow: "Bind Orb", pattern: worldIdActions.bindOrb("{ownerAddress}"), level: "orb" },
  { flow: "Check in", pattern: worldIdActions.checkin("{ownerAddress}"), level: "device" },
  { flow: "Request extension", pattern: worldIdActions.requestExtension("{ownerAddress}"), level: "device" },
  { flow: "Freeze evaluation", pattern: worldIdActions.block("{ownerAddress}"), level: "orb" },
  { flow: "Reverse alarm", pattern: worldIdActions.resurrect("{ownerAddress}"), level: "orb" },
  {
    flow: "Claim requestor slot",
    pattern: worldIdActions.claimRequestorSlot("{ownerAddress}", "{requestor}"),
    level: "device",
  },
  { flow: "Request evaluation", pattern: worldIdActions.requestEvaluation("{ownerAddress}"), level: "device" },
] as const;

export const CONNECTION_KIT_INTEGRATION_STEPS = [
  {
    title: "Use Pulse's World ID app_id in your consumer app (e.g. Legacy Ledger)",
    explanation:
      "Embed the same World ID app_id Pulse uses so proofs your users generate in your app verify against the Pulse contract — not inside Pulse Explorer.",
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
    title: "Read profile state by profileId",
    explanation:
      "profileId = keccak256(ownerAddress, yourConsumerWallet). One owner can have multiple profiles across consumer apps.",
    snippetKey: "profilesRead" as const,
  },
  {
    title: "React to outcomes",
    explanation:
      "Listen for ThresholdReached on profileId, or implement IThresholdConsumer and set your contract as the profile notification target.",
    snippetKey: "outcomes" as const,
  },
] as const;

export const buildConnectionKitSnippets = (params: {
  appId: string;
  contractAddress: string;
  consumerAddress?: string;
}) => {
  const { appId, contractAddress, consumerAddress = "0xYourConsumerWallet" } = params;
  const appIdValue = appId || "app_...";
  const contract = contractAddress || "0x...";

  return {
    appId: `export const PULSE_WORLD_APP_ID = "${appIdValue}";`,
    idKit: `<IDKitWidget
  app_id="${appIdValue}"
  action="${worldIdActions.checkin("{ownerAddress}")}"
  signal="{ownerAddress}"
  verification_level="device"
  onSuccess={async (proof) => {
    // pass proof to PulseOracle (step 3)
  }}
/>`,
    checkinWrite: `await pulseOracle.write.checkin([
  profileId,
  proof.root,
  proof.nullifier_hash,
  proof.proof,
]);`,
    profilesRead: `import { keccak256, encodePacked } from "viem";

const profileId = keccak256(
  encodePacked(["address", "address"], [ownerAddress, "${consumerAddress}"]),
);

const profile = await pulseOracle.read.profiles([profileId]);
// profile.lifecycle, profile.accumulatedWeight, profile.threshold — decoded in your app only`,
    outcomes: `// Push: implement IThresholdConsumer
interface IThresholdConsumer {
  function onThresholdReached(bytes32 profileId, string calldata auditBlobId) external;
}

// Pull: watch ThresholdReached(profileId indexed, epoch, auditBlobId)

// Explorer shows only encrypted Walrus blobs — never decoded weights`,
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
