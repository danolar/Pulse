"use client";

import { useState } from "react";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import { GoogleActivityConnect } from "~~/components/pulse/modules/GoogleActivityConnect";
import { VoiceAgentConnect } from "~~/components/pulse/modules/VoiceAgentConnect";
import { usePulseStore } from "~~/services/store/pulseStore";
import {
  PULSE_MODULE_CATEGORY_LABELS,
  PULSE_MODULE_STATUS_LABELS,
  getPulseModule,
  getPulseModulesByCategory,
  getSelectablePulseModules,
  isModuleReadyForSetup,
} from "~~/modules/pulse";
import type { PulseModuleStatus, PulseVerificationModule } from "~~/modules/pulse";
import { notification } from "~~/utils/scaffold-eth/notification";

const STATUS_BADGE_CLASS: Record<PulseModuleStatus, string> = {
  implemented: "bg-success/15 text-success",
  demo: "bg-primary/15 text-primary",
  planned: "bg-base-300 text-pulse-muted",
  interface: "bg-base-300 text-pulse-muted",
};

type ModuleCardProps = {
  pulseModule: PulseVerificationModule;
  enabled: boolean;
  locked: boolean;
  onToggle: () => void;
  adapterAddress: string;
  adapterWeight: number;
  onAdapterChange: (patch: { address?: string; weight?: number }) => void;
  googleRefreshToken: number;
  googleLinked: boolean;
  voiceLinked: boolean;
  onGoogleLinkedChange: (linked: boolean) => void;
  onVoiceLinkedChange: (linked: boolean) => void;
};

const ModuleCard = ({
  pulseModule,
  enabled,
  locked,
  onToggle,
  adapterAddress,
  adapterWeight,
  onAdapterChange,
  googleRefreshToken,
  googleLinked,
  voiceLinked,
  onGoogleLinkedChange,
  onVoiceLinkedChange,
}: ModuleCardProps) => {
  const isGoogleModule = pulseModule.id === "google-activity";
  const isTwilioVoiceModule = pulseModule.id === "twilio-voice";
  const isActive = enabled || (isGoogleModule && googleLinked) || (isTwilioVoiceModule && voiceLinked);
  const showSoon = !isModuleReadyForSetup(pulseModule);
  const showAdapterFields =
    enabled &&
    pulseModule.setupKind === "adapter" &&
    isModuleReadyForSetup(pulseModule) &&
    pulseModule.id !== "google-activity";
  const showIntegrationPlaceholder =
    enabled && pulseModule.setupKind === "integration" && !isTwilioVoiceModule;
  const showIdentityNote = enabled && pulseModule.setupKind === "none";
  const showPlannedPlaceholder =
    enabled && pulseModule.setupKind === "adapter" && !isModuleReadyForSetup(pulseModule);

  return (
    <div
      className={`rounded-2xl border p-4 transition-colors ${
        isActive ? "border-primary/40 bg-primary/5" : "border-base-content/10 bg-base-200/40"
      }`}
    >
      <div className="flex gap-3">
        <input
          type="checkbox"
          className="checkbox checkbox-primary checkbox-sm mt-0.5 shrink-0"
          checked={isActive}
          disabled={locked}
          onChange={onToggle}
        />
        <div className="min-w-0 flex-1">
          <span className="mb-1 flex flex-wrap items-center gap-2">
            <span className="pulse-item-title">{pulseModule.name}</span>
            {showSoon && !enabled ? (
              <span className={`badge badge-sm border-none ${STATUS_BADGE_CLASS[pulseModule.status]}`}>
                {PULSE_MODULE_STATUS_LABELS[pulseModule.status]}
              </span>
            ) : null}
            {locked ? (
              <span className="badge badge-sm border-none bg-base-300 text-pulse-muted">Required</span>
            ) : null}
          </span>
          <span className="block text-sm leading-relaxed text-pulse-muted">{pulseModule.summary}</span>
        </div>
      </div>

      {showIdentityNote ? (
        <p className="mt-3 border-t border-base-content/10 pt-3 text-xs text-pulse-muted">
          Bound with World ID in the Identity step below.
        </p>
      ) : null}

      {showPlannedPlaceholder ? (
        <p className="mt-3 border-t border-base-content/10 pt-3 text-xs text-pulse-muted">
          Selected — connection unlocks when this source ships.
        </p>
      ) : null}

      {isGoogleModule ? (
        <GoogleActivityConnect
          moduleEnabled={enabled}
          refreshToken={googleRefreshToken}
          onLinkedChange={onGoogleLinkedChange}
        />
      ) : null}

      {isTwilioVoiceModule ? (
        <VoiceAgentConnect moduleEnabled={enabled} onLinkedChange={onVoiceLinkedChange} />
      ) : null}

      {showIntegrationPlaceholder ? (
        <p className="mt-3 border-t border-base-content/10 pt-3 text-xs text-pulse-muted">
          {isModuleReadyForSetup(pulseModule)
            ? "Selected — account linking ships in the next release."
            : "Selected — connection flow coming soon."}
        </p>
      ) : null}

      {showAdapterFields ? (
        <div className="mt-3 space-y-2 border-t border-base-content/10 pt-3" onClick={event => event.stopPropagation()}>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <input
              className="input input-bordered input-sm rounded-2xl sm:col-span-2"
              placeholder="Signer address (CRE workflow or adapter)"
              value={adapterAddress}
              onChange={event => onAdapterChange({ address: event.target.value })}
            />
            <input
              className="input input-bordered input-sm rounded-2xl"
              placeholder="Weight"
              type="number"
              min={1}
              value={adapterWeight}
              onChange={event => onAdapterChange({ weight: Number(event.target.value) || 0 })}
            />
          </div>
          <p className="text-xs text-pulse-muted">
            Reports inactivity up to +{adapterWeight} points toward your threshold.
          </p>
        </div>
      ) : null}
    </div>
  );
};

export const validateEnabledModulesForActivation = (): boolean => {
  const { enabledModuleIds, adapters } = usePulseStore.getState();

  for (const moduleId of enabledModuleIds) {
    const module = getPulseModule(moduleId);
    if (!module || module.setupKind !== "adapter" || !isModuleReadyForSetup(module)) continue;
    if (moduleId === "google-activity") continue;
    const adapter = adapters.find(row => row.moduleId === moduleId);
    if (!adapter?.address?.trim()) {
      notification.error(`Connect a signer for ${module.name} or disable it below.`);
      return false;
    }
  }

  return true;
};

export const VerificationPackagePanel = ({ googleRefreshToken = 0 }: { googleRefreshToken?: number }) => {
  const { enabledModuleIds, adapters, requestors, toggleModule, setModuleAdapter, mockAddRequestor } =
    usePulseStore();
  const [requestorAddress, setRequestorAddress] = useState("");
  const [googleLinked, setGoogleLinked] = useState(false);
  const [voiceLinked, setVoiceLinked] = useState(false);
  const selectableIds = new Set(getSelectablePulseModules().map(module => module.id));
  const byCategory = getPulseModulesByCategory();

  const getAdapter = (moduleId: string) => adapters.find(adapter => adapter.moduleId === moduleId);

  return (
    <section className="pulse-card p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="pulse-section-title">Stage 1 · Verification package</h2>
        <p className="mt-1 text-sm text-pulse-muted">
          Enable each signal source and connect it here. World ID is always included. Passive modules need a signer
          address before monitoring can start.
        </p>
      </div>

      <div className="space-y-6">
        {(Object.entries(byCategory) as Array<[keyof typeof byCategory, PulseVerificationModule[]]>).map(
          ([category, modules]) =>
            modules.length > 0 ? (
              <div key={category}>
                <h3 className="pulse-label mb-3">{PULSE_MODULE_CATEGORY_LABELS[category]}</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {modules.map(pulseModule => {
                    const enabled = enabledModuleIds.includes(pulseModule.id);
                    const locked = pulseModule.required === true;
                    const canToggle = locked || selectableIds.has(pulseModule.id);
                    const adapter = getAdapter(pulseModule.id);

                    return (
                      <ModuleCard
                        key={pulseModule.id}
                        pulseModule={pulseModule}
                        enabled={enabled}
                        locked={locked}
                        adapterAddress={adapter?.address ?? ""}
                        adapterWeight={adapter?.weight ?? pulseModule.suggestedWeight ?? 10}
                        onToggle={() => {
                          if (canToggle && !locked) toggleModule(pulseModule.id);
                        }}
                        onAdapterChange={patch => setModuleAdapter(pulseModule.id, patch)}
                        googleRefreshToken={googleRefreshToken}
                        googleLinked={googleLinked}
                        voiceLinked={voiceLinked}
                        onGoogleLinkedChange={linked => {
                          setGoogleLinked(linked);
                          if (linked) {
                            usePulseStore.getState().ensureModuleEnabled("google-activity");
                          }
                        }}
                        onVoiceLinkedChange={linked => {
                          setVoiceLinked(linked);
                          if (linked) {
                            usePulseStore.getState().ensureModuleEnabled("twilio-voice");
                          }
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            ) : null,
        )}
      </div>

      <div className="mt-8 border-t border-base-content/10 pt-6">
        <h3 className="pulse-item-title mb-1">Trusted requestors (optional)</h3>
        <p className="mb-3 text-xs text-pulse-muted">
          People who may request a formal evaluation — for example a beneficiary or emergency contact. They claim their
          slot with World ID Device verification.
        </p>
        <div className="mb-3 overflow-x-auto rounded-2xl border border-base-content/10">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Address</th>
                <th>Authorized</th>
                <th>Claimed</th>
              </tr>
            </thead>
            <tbody>
              {requestors.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-pulse-muted">
                    None yet
                  </td>
                </tr>
              ) : (
                requestors.map(requestor => (
                  <tr key={requestor.id}>
                    <td className="font-mono text-xs">{requestor.address}</td>
                    <td>{requestor.authorized ? "Yes" : "No"}</td>
                    <td>{requestor.claimed ? "Yes" : "Pending"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <input
          className="input input-bordered w-full rounded-2xl"
          placeholder="Requestor wallet address"
          value={requestorAddress}
          onChange={event => setRequestorAddress(event.target.value)}
        />
        <PulseButton
          variant="secondary"
          className="mt-3"
          disabled={!requestorAddress.trim()}
          onClick={() => {
            mockAddRequestor(requestorAddress.trim());
            setRequestorAddress("");
          }}
        >
          Authorize requestor
        </PulseButton>
      </div>
    </section>
  );
};
