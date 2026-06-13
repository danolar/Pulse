/** How a module participates in the weighted verification model. */
export type PulseModuleCategory = "identity" | "passive" | "active" | "decision";

export type PulseModuleStatus = "implemented" | "demo" | "planned" | "interface";

export type PulseSignalDirection = "positive" | "negative" | "both";

/** What the owner configures in setup when the module is enabled. */
export type PulseModuleSetupKind = "none" | "adapter" | "integration";

/**
 * Declarative definition for one verification pulse module.
 * Add a folder under `modules/pulse/<slug>/` and register in `registry.ts`.
 */
export type PulseVerificationModule = {
  id: string;
  name: string;
  category: PulseModuleCategory;
  status: PulseModuleStatus;
  summary: string;
  provider: string;
  signalDirection: PulseSignalDirection;
  complements: string[];
  verificationType?: string;
  docsUrl?: string;
  adapterLabel?: string;
  suggestedWeight?: number;
  /** Always on — cannot be toggled off (World ID). */
  required?: boolean;
  /** Shown in the package picker (default true). */
  selectable?: boolean;
  /** Setup step when enabled. */
  setupKind?: PulseModuleSetupKind;
};

export const PULSE_MODULE_CATEGORY_LABELS: Record<PulseModuleCategory, string> = {
  identity: "Identity",
  passive: "Passive monitoring",
  active: "Active check-ins",
  decision: "Decision layer",
};

export const PULSE_MODULE_STATUS_LABELS: Record<PulseModuleStatus, string> = {
  implemented: "Available",
  demo: "Preview",
  planned: "Coming soon",
  interface: "Coming soon",
};

export const DEFAULT_ENABLED_MODULE_IDS = ["world-id", "onchain-activity"] as const;
