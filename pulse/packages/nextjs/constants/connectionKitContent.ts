import { worldIdActions } from "~~/constants/pulseProtocol";

export const CONNECTION_KIT_PANEL_TITLE = "Connect your app";

export const CONNECTION_KIT_PANEL_INTRO =
  "Integrate via profileId = keccak256(ownerAddress, yourWallet). Users sign with their own wallet; you read full state in your dashboard.";

export const CONNECTION_KIT_DEPLOYMENT_NOTE =
  "Official Pulse deployment values. Replace the contract address and app_id if you run your own instance.";

export const CONNECTION_KIT_CONSUME_EXTEND_NOTE =
  "Most integrations read state and react to outcomes (steps 1–5). To author a signal adapter, see the adapter guide below.";

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
    title: "Use Pulse's World ID app_id",
    explanation: "Embed the same app_id so proofs from your app verify against Pulse.",
    snippetKey: "appId" as const,
  },
  {
    title: "Configure IDKit per action",
    explanation: "Each gated function expects a specific action string and verification level.",
    snippetKey: "idKit" as const,
    includeActionTable: true,
  },
  {
    title: "Call the contract with the proof",
    explanation: "Pass the IDKit proof into the matching PulseOracle write.",
    snippetKey: "checkinWrite" as const,
  },
  {
    title: "Read profile state by profileId",
    explanation: "profileId = keccak256(ownerAddress, yourWallet). One owner can have multiple profiles across apps.",
    snippetKey: "profilesRead" as const,
  },
  {
    title: "React to outcomes",
    explanation: "Listen for ThresholdReached or implement IThresholdConsumer as the notification target.",
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
// profile.lifecycle, profile.accumulatedWeight, profile.threshold`,
    outcomes: `// Public: ThresholdReached(profileId) + lifecycle state
// Private: accumulatedWeight, threshold, signal direction — dashboard only

interface IThresholdConsumer {
  function onThresholdReached(bytes32 profileId, string calldata auditBlobId) external;
}`,
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
