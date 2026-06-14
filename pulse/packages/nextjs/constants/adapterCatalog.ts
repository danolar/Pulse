import { getPulseModule } from "~~/modules/pulse";
import {
  INTERNAL_ADAPTER_IDS,
  getInternalAdapterAddress,
  type InternalAdapterId,
} from "~~/constants/internalAdapters";

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
  /** Pulse-hosted adapters — no consumer API keys; weight + authorizeAdapter only. */
  isInternal?: boolean;
  dataPlaneFields: { key: string; label: string; placeholder: string; secret?: boolean }[];
};

const moduleCapabilities = (id: InternalAdapterId): AdapterCapability => {
  const module = getPulseModule(id);
  if (!module) return "both";
  if (module.signalDirection === "positive") return "life";
  if (module.signalDirection === "negative") return "inactivity";
  return "both";
};

export const ADAPTER_CATALOG: AdapterCatalogEntry[] = INTERNAL_ADAPTER_IDS.flatMap(id => {
  const module = getPulseModule(id);
  if (!module) return [];

  return [
    {
      id,
      name: module.name,
      description: module.summary,
      typeLabel: module.adapterLabel ?? module.id.toUpperCase(),
      adapterAddress: getInternalAdapterAddress(id),
      suggestedWeight: module.suggestedWeight ?? 10,
      capabilities: moduleCapabilities(id),
      isInternal: true,
      dataPlaneFields: [],
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
