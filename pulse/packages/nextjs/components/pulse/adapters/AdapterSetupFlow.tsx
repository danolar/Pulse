"use client";

import { useEffect, useMemo, useState } from "react";
import { PulseModal } from "~~/components/pulse/modals/PulseModal";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import { NumberField } from "~~/components/pulse/ui/NumberField";
import type { AdapterCatalogEntry } from "~~/constants/adapterCatalog";
import {
  INTERNAL_ADAPTER_PROVIDERS,
  PULSE_ORACLE_DEPLOY_NOTE,
  isInternalAdapterId,
} from "~~/constants/internalAdapters";

type AdapterSetupFlowProps = {
  entry: AdapterCatalogEntry | null;
  onClose: () => void;
  onComplete: (params: {
    catalogId: string;
    name: string;
    typeLabel: string;
    adapterAddress: string;
    weight: number;
    capabilities: AdapterCatalogEntry["capabilities"];
    isDecisionLayer?: boolean;
  }) => void;
};

const CAPABILITY_OPTIONS: AdapterCatalogEntry["capabilities"][] = ["life", "inactivity", "both"];

export const AdapterSetupFlow = ({ entry, onClose, onComplete }: AdapterSetupFlowProps) => {
  const [step, setStep] = useState(0);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [weight, setWeight] = useState(entry?.suggestedWeight ?? 10);
  const [capabilities, setCapabilities] = useState<AdapterCatalogEntry["capabilities"]>(
    entry?.capabilities ?? "both",
  );

  const isInternal = Boolean(entry?.isInternal);
  const hasCredentialFields = (entry?.dataPlaneFields.length ?? 0) > 0;
  const provider = entry && isInternalAdapterId(entry.id) ? INTERNAL_ADAPTER_PROVIDERS[entry.id] : null;

  const steps = useMemo(() => {
    if (!entry) return [];
    if (entry.isDecisionLayer) {
      return [{ id: "credentials", title: "Attestation key" }, { id: "confirm", title: "Confirm" }];
    }
    if (isInternal) {
      return [
        { id: "provider", title: "Provider" },
        { id: "weight", title: "Weight" },
        { id: "confirm", title: "Confirm" },
      ];
    }
    const list = [{ id: "credentials", title: "API credentials" }];
    list.push({ id: "weight", title: "Weight" });
    list.push({ id: "capabilities", title: "Capabilities" });
    list.push({ id: "confirm", title: "Confirm" });
    return list;
  }, [entry, isInternal]);

  useEffect(() => {
    if (!entry) return;
    setStep(0);
    setFieldValues({});
    setWeight(entry.suggestedWeight);
    setCapabilities(entry.capabilities);
  }, [entry]);

  if (!entry) return null;

  const currentStep = steps[step];
  const adapterAddress = entry.adapterAddress?.trim() ?? "";

  const resetAndClose = () => {
    setStep(0);
    setFieldValues({});
    setWeight(entry.suggestedWeight);
    setCapabilities(entry.capabilities);
    onClose();
  };

  const handleConfirm = () => {
    onComplete({
      catalogId: entry.id,
      name: entry.name,
      typeLabel: entry.typeLabel,
      adapterAddress,
      weight: entry.isDecisionLayer ? 0 : weight,
      capabilities: isInternal ? entry.capabilities : capabilities,
      isDecisionLayer: entry.isDecisionLayer,
    });
    resetAndClose();
  };

  const renderStep = () => {
    if (!currentStep) return null;

    if (currentStep.id === "provider" && provider) {
      return (
        <div className="space-y-4">
          <p className="text-sm text-pulse-muted">{PULSE_ORACLE_DEPLOY_NOTE}</p>
          <dl className="space-y-2 rounded-2xl border border-base-content/10 p-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-pulse-muted">Provider</dt>
              <dd>{provider.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-pulse-muted">Role</dt>
              <dd className="text-right">{provider.role}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-pulse-muted">Authorized signer</dt>
              <dd className="max-w-[14rem] truncate font-mono text-xs">{adapterAddress}</dd>
            </div>
          </dl>
          <p className="text-xs leading-relaxed text-pulse-muted">{provider.deployNote}</p>
        </div>
      );
    }

    if (currentStep.id === "credentials" && hasCredentialFields) {
      return (
        <div className="space-y-4">
          <p className="text-xs leading-relaxed text-pulse-muted">
            Keys go directly to the adapter service. Pulse never stores them.
          </p>
          {entry.dataPlaneFields.map(field => (
            <label key={field.key} className="form-control">
              <span className="label-text mb-1 text-sm">{field.label}</span>
              <input
                type={field.secret ? "password" : "text"}
                className="input input-bordered rounded-2xl font-mono text-sm"
                placeholder={field.placeholder}
                value={fieldValues[field.key] ?? ""}
                onChange={event =>
                  setFieldValues(previous => ({ ...previous, [field.key]: event.target.value }))
                }
              />
            </label>
          ))}
        </div>
      );
    }

    if (currentStep.id === "weight") {
      if (entry.isDecisionLayer) {
        return (
          <p className="text-sm text-pulse-muted">
            Decision-layer adapters use weight 0 — they gate evaluation, not threshold accumulation.
          </p>
        );
      }
      return (
        <div className="space-y-4">
          <p className="text-sm text-pulse-muted">
            Default is {entry.suggestedWeight}. Applies to every profile this consumer creates.
          </p>
          <NumberField label="Weight" unit="points" value={weight} onChange={setWeight} />
        </div>
      );
    }

    if (currentStep.id === "capabilities") {
      return (
        <div className="space-y-3">
          <p className="text-sm text-pulse-muted">Reflects what the adapter can detect for this binding.</p>
          <div className="flex flex-wrap gap-2">
            {CAPABILITY_OPTIONS.map(option => (
              <button
                key={option}
                type="button"
                className={`btn btn-sm rounded-xl ${capabilities === option ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setCapabilities(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (currentStep.id === "confirm") {
      return (
        <div className="space-y-3 text-sm">
          <p className="text-pulse-muted">Review and save this adapter to your integration.</p>
          <dl className="space-y-2 rounded-2xl border border-base-content/10 p-4">
            <div className="flex justify-between gap-4">
              <dt className="text-pulse-muted">Adapter</dt>
              <dd>{entry.name}</dd>
            </div>
            {adapterAddress ? (
              <div className="flex justify-between gap-4">
                <dt className="text-pulse-muted">Signer</dt>
                <dd className="font-mono text-xs">{adapterAddress}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <dt className="text-pulse-muted">Weight</dt>
              <dd>{entry.isDecisionLayer ? 0 : weight}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-pulse-muted">Capabilities</dt>
              <dd>{isInternal ? entry.capabilities : capabilities}</dd>
            </div>
            {isInternal && provider ? (
              <div className="flex justify-between gap-4">
                <dt className="text-pulse-muted">Hosted by</dt>
                <dd>{provider.name}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      );
    }

    return null;
  };

  return (
    <PulseModal
      open={Boolean(entry)}
      title={`Set up ${entry.name}`}
      onClose={resetAndClose}
      size="lg"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          {step > 0 ? (
            <PulseButton variant="ghost" onClick={() => setStep(step - 1)}>
              Back
            </PulseButton>
          ) : (
            <PulseButton variant="ghost" onClick={resetAndClose}>
              Cancel
            </PulseButton>
          )}
          {step < steps.length - 1 ? (
            <PulseButton onClick={() => setStep(step + 1)}>
              {currentStep?.id === "capabilities" ? "Review" : "Continue"}
            </PulseButton>
          ) : (
            <PulseButton onClick={handleConfirm}>Save configuration</PulseButton>
          )}
        </div>
      }
    >
      <p className="mb-4 text-xs text-pulse-muted">
        Step {step + 1} of {steps.length} · {currentStep?.title}
      </p>
      {renderStep()}
    </PulseModal>
  );
};
