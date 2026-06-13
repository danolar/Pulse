"use client";

import { useState } from "react";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import { StatusTag } from "~~/components/pulse/ui/StatusTag";
import { SIGNALS_STAGE_SCOPE_NOTE } from "~~/constants/setupExplorerCopy";
import { usePulseStore } from "~~/services/store/pulseStore";
import {
  PULSE_MODULE_STATUS_LABELS,
  getPulseModulesByCategory,
  getSelectablePulseModules,
  isModuleReadyForSetup,
} from "~~/modules/pulse";
import type { PulseModuleStatus, PulseVerificationModule } from "~~/modules/pulse";

const STATUS_BADGE_CLASS: Record<PulseModuleStatus, string> = {
  implemented: "bg-success/15 text-success",
  demo: "bg-primary/15 text-primary",
  planned: "bg-base-300 text-pulse-muted",
  interface: "bg-base-300 text-pulse-muted",
};

const capabilityLabel = (module: PulseVerificationModule): string => {
  if (module.signalDirection === "positive") return "life";
  if (module.signalDirection === "negative") return "inactivity";
  return "both";
};

const CapabilityTag = ({ module }: { module: PulseVerificationModule }) => (
  <StatusTag label={capabilityLabel(module)} tone="neutral" />
);

type AdapterRowProps = {
  pulseModule: PulseVerificationModule;
  enabled: boolean;
  locked: boolean;
  adapterAddress: string;
  adapterWeight: number;
  onToggle: () => void;
  onAdapterChange: (patch: { address?: string; weight?: number }) => void;
};

const AdapterRow = ({
  pulseModule,
  enabled,
  locked,
  adapterAddress,
  adapterWeight,
  onToggle,
  onAdapterChange,
}: AdapterRowProps) => {
  const isDecisionAgent = pulseModule.id === "ai-agent";
  const showAdapterFields =
    enabled && pulseModule.setupKind === "adapter" && isModuleReadyForSetup(pulseModule);
  const showSoon = !isModuleReadyForSetup(pulseModule);

  return (
    <div
      className={`rounded-2xl border p-4 transition-colors ${
        enabled ? "border-primary/40 bg-primary/5" : "border-base-content/10 bg-base-200/40"
      }`}
    >
      <div className="flex gap-3">
        <input
          type="checkbox"
          className="checkbox checkbox-primary checkbox-sm mt-0.5 shrink-0"
          checked={enabled}
          disabled={locked}
          onChange={onToggle}
        />
        <div className="min-w-0 flex-1">
          <span className="mb-1 flex flex-wrap items-center gap-2">
            <span className="pulse-item-title">{pulseModule.name}</span>
            <CapabilityTag module={pulseModule} />
            {showSoon && !enabled ? (
              <span className={`badge badge-sm border-none ${STATUS_BADGE_CLASS[pulseModule.status]}`}>
                {PULSE_MODULE_STATUS_LABELS[pulseModule.status]}
              </span>
            ) : null}
            {locked ? <StatusTag label="Required" tone="accent" /> : null}
          </span>
          <span className="block text-sm leading-relaxed text-pulse-muted">{pulseModule.summary}</span>
        </div>
      </div>

      {pulseModule.setupKind === "none" && enabled ? (
        <p className="mt-3 border-t border-base-content/10 pt-3 text-xs text-pulse-muted">
          Bound with World ID in the Identity stage.
        </p>
      ) : null}

      {enabled && !isModuleReadyForSetup(pulseModule) && pulseModule.setupKind === "adapter" ? (
        <p className="mt-3 border-t border-base-content/10 pt-3 text-xs text-pulse-muted">
          Selected — connection unlocks when this source ships.
        </p>
      ) : null}

      {showAdapterFields ? (
        <div className="mt-3 space-y-2 border-t border-base-content/10 pt-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <input
              className="input input-bordered input-sm rounded-2xl sm:col-span-2"
              placeholder="Adapter signer address"
              value={adapterAddress}
              onChange={event => onAdapterChange({ address: event.target.value })}
            />
            {isDecisionAgent ? (
              <span className="flex items-center text-xs text-pulse-muted">Weight ignored (decision layer)</span>
            ) : (
              <input
                className="input input-bordered input-sm rounded-2xl"
                placeholder="Weight"
                type="number"
                min={1}
                value={adapterWeight}
                onChange={event => onAdapterChange({ weight: Number(event.target.value) || 0 })}
              />
            )}
          </div>
          {!isDecisionAgent ? (
            <p className="text-xs text-pulse-muted">
              authorizeAdapter — reports up to +{adapterWeight} toward threshold when inactive.
            </p>
          ) : (
            <p className="text-xs text-pulse-muted">
              authorizeAdapter with AI_DECISION type — optional decision layer, not weighted.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
};

const DecisionLayerSubBlock = ({
  modules,
  enabledModuleIds,
  getAdapter,
  onToggle,
}: {
  modules: PulseVerificationModule[];
  enabledModuleIds: string[];
  getAdapter: (moduleId: string) => ReturnType<typeof usePulseStore.getState>["adapters"][number] | undefined;
  onToggle: (moduleId: string, locked: boolean) => void;
}) => {
  if (modules.length === 0) return null;

  return (
    <div className="rounded-2xl border border-dashed border-base-content/15 bg-base-200/30 p-4">
      <h4 className="pulse-item-title mb-1">Decision layer (optional)</h4>
      <p className="mb-3 text-xs text-pulse-muted">
        AI decision adapter — not weighted; approves or blocks requestor-driven evaluation paths.
      </p>
      <div className="grid gap-3">
        {modules.map(pulseModule => {
          const enabled = enabledModuleIds.includes(pulseModule.id);
          const adapter = getAdapter(pulseModule.id);

          return (
            <AdapterRow
              key={pulseModule.id}
              pulseModule={pulseModule}
              enabled={enabled}
              locked={false}
              adapterAddress={adapter?.address ?? ""}
              adapterWeight={0}
              onToggle={() => onToggle(pulseModule.id, false)}
              onAdapterChange={patch => usePulseStore.getState().setModuleAdapter(pulseModule.id, patch)}
            />
          );
        })}
      </div>
    </div>
  );
};

export const SignalAdaptersSection = () => {
  const { enabledModuleIds, adapters, toggleModule, setModuleAdapter } = usePulseStore();
  const selectableIds = new Set(getSelectablePulseModules().map(module => module.id));
  const byCategory = getPulseModulesByCategory();
  const decisionModules = byCategory.decision;
  const signalCategories = (["identity", "passive", "active"] as const).flatMap(category => byCategory[category]);

  const getAdapter = (moduleId: string) => adapters.find(adapter => adapter.moduleId === moduleId);

  const handleToggle = (moduleId: string, locked: boolean) => {
    if (!locked && selectableIds.has(moduleId)) toggleModule(moduleId);
  };

  return (
    <section className="pulse-card p-5 sm:p-6">
      <div className="mb-5 space-y-3">
        <h2 className="pulse-section-title">Signal adapters</h2>
        <p className="text-sm text-pulse-muted">
          Authorize signer addresses that may report weighted signals for this profile. World ID is always included.
        </p>
        <p className="rounded-2xl border border-base-content/10 bg-base-200/40 px-4 py-3 text-xs leading-relaxed text-pulse-muted">
          {SIGNALS_STAGE_SCOPE_NOTE}
        </p>
      </div>

      <div className="space-y-6">
        {signalCategories.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {signalCategories.map(pulseModule => {
              const enabled = enabledModuleIds.includes(pulseModule.id);
              const locked = pulseModule.required === true;
              const adapter = getAdapter(pulseModule.id);

              return (
                <AdapterRow
                  key={pulseModule.id}
                  pulseModule={pulseModule}
                  enabled={enabled}
                  locked={locked}
                  adapterAddress={adapter?.address ?? ""}
                  adapterWeight={adapter?.weight ?? pulseModule.suggestedWeight ?? 10}
                  onToggle={() => handleToggle(pulseModule.id, locked)}
                  onAdapterChange={patch => setModuleAdapter(pulseModule.id, patch)}
                />
              );
            })}
          </div>
        ) : null}

        <DecisionLayerSubBlock
          modules={decisionModules}
          enabledModuleIds={enabledModuleIds}
          getAdapter={getAdapter}
          onToggle={handleToggle}
        />
      </div>
    </section>
  );
};

const RequestorStatusTag = ({ authorized, claimed }: { authorized: boolean; claimed: boolean }) => {
  if (claimed) return <StatusTag label="Verified" tone="success" />;
  if (authorized) return <StatusTag label="Awaiting verification" tone="warning" />;
  return <StatusTag label="Unauthorized" tone="neutral" />;
};

export const TrustedRequestorsSection = () => {
  const { requestors, mockAddRequestor } = usePulseStore();
  const [requestorAddress, setRequestorAddress] = useState("");

  return (
    <section className="pulse-card p-5 sm:p-6">
      <h2 className="pulse-section-title mb-1">Trusted requestors</h2>
      <p className="mb-4 text-sm text-pulse-muted">
        authorizeRequestor — wallets that may request a formal evaluation after claiming their slot with World ID.
      </p>

      {requestors.length === 0 ? (
        <p className="mb-4 text-sm text-pulse-muted">No requestors authorized yet.</p>
      ) : (
        <ul className="mb-4 space-y-2">
          {requestors.map(requestor => (
            <li
              key={requestor.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-base-content/10 px-3 py-2"
            >
              <span className="font-mono text-xs">{requestor.address}</span>
              <RequestorStatusTag authorized={requestor.authorized} claimed={requestor.claimed} />
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          className="input input-bordered flex-1 rounded-2xl font-mono text-sm"
          placeholder="Requestor wallet address"
          value={requestorAddress}
          onChange={event => setRequestorAddress(event.target.value)}
        />
        <PulseButton
          variant="secondary"
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
