import { getPulseModule } from "~~/modules/pulse";

export type AdapterCapability = "life" | "inactivity" | "both";

export type AdapterCatalogEntry = {
  id: string;
  name: string;
  description: string;
  typeLabel: string;
  adapterAddress: string;
  suggestedWeight: number;
  capabilities: AdapterCapability;
  isDecisionLayer?: boolean;
  dataPlaneFields: { key: string; label: string; placeholder: string; secret?: boolean }[];
};

const moduleEntries = ["onchain-activity", "google-activity", "twilio-voice"] as const;

export const ADAPTER_CATALOG: AdapterCatalogEntry[] = moduleEntries.flatMap(id => {
  const module = getPulseModule(id);
  if (!module) return [];

  return [
    {
      id,
      name: module.name,
      description: module.summary,
      typeLabel: module.adapterLabel ?? module.id.toUpperCase(),
      adapterAddress: "",
      suggestedWeight: module.suggestedWeight ?? 10,
      capabilities:
        module.signalDirection === "positive"
          ? "life"
          : module.signalDirection === "negative"
            ? "inactivity"
            : "both",
      dataPlaneFields:
        id === "google-activity"
          ? [{ key: "oauthToken", label: "OAuth token", placeholder: "Token from your OAuth flow", secret: true }]
          : id === "twilio-voice"
            ? [{ key: "accountSid", label: "Twilio Account SID", placeholder: "AC…", secret: true }]
            : [{ key: "signerKey", label: "Signer key", placeholder: "0x… or key ref", secret: true }],
    },
  ];
});

export const AI_DECISION_CATALOG_ENTRY: AdapterCatalogEntry = {
  id: "ai-agent",
  name: "AI decision agent",
  description: "Gates evaluation requests — does not contribute weight toward threshold.",
  typeLabel: "AI_DECISION",
  adapterAddress: "",
  suggestedWeight: 0,
  capabilities: "both",
  isDecisionLayer: true,
  dataPlaneFields: [{ key: "attestationKey", label: "Attestation key", placeholder: "key…", secret: true }],
};

export const getCatalogEntry = (id: string): AdapterCatalogEntry | undefined =>
  [...ADAPTER_CATALOG, AI_DECISION_CATALOG_ENTRY].find(entry => entry.id === id);
