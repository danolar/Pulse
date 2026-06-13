"use client";

import { useState } from "react";
import { PulseModal } from "~~/components/pulse/modals/PulseModal";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import { NumberField } from "~~/components/pulse/ui/NumberField";
import { KEY_STORAGE_NOTE } from "~~/constants/explorerCopy";
import type { AdapterCatalogEntry } from "~~/constants/adapterCatalog";

const mockSignerAddress = (catalogId: string): string => {
  const hex = catalogId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0).toString(16), "")
    .padEnd(40, "a")
    .slice(0, 40);
  return `0x${hex}`;
};

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

export const AdapterSetupFlow = ({ entry, onClose, onComplete }: AdapterSetupFlowProps) => {
  const [step, setStep] = useState(0);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [weight, setWeight] = useState(entry?.suggestedWeight ?? 10);
  const [bindingAddress, setBindingAddress] = useState("");

  if (!entry) return null;

  const resetAndClose = () => {
    setStep(0);
    setFieldValues({});
    setWeight(entry.suggestedWeight);
    setBindingAddress("");
    onClose();
  };

  const handleBind = () => {
    setBindingAddress(mockSignerAddress(entry.id));
    setStep(1);
  };

  const handleSubmitKeys = () => {
    setStep(2);
  };

  const handleAuthorize = () => {
    onComplete({
      catalogId: entry.id,
      name: entry.name,
      typeLabel: entry.typeLabel,
      adapterAddress: bindingAddress,
      weight: entry.isDecisionLayer ? 0 : weight,
      capabilities: entry.capabilities,
      isDecisionLayer: entry.isDecisionLayer,
    });
    resetAndClose();
  };

  const stepTitles = ["Bind signer", "Data plane credentials", "Authorize on profile"];

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
          {step === 0 ? (
            <PulseButton onClick={handleBind}>Mock bind signer</PulseButton>
          ) : null}
          {step === 1 ? (
            <PulseButton onClick={handleSubmitKeys}>Save credentials (mock)</PulseButton>
          ) : null}
          {step === 2 ? (
            <PulseButton onClick={handleAuthorize}>Authorize adapter</PulseButton>
          ) : null}
        </div>
      }
    >
      <p className="mb-4 text-xs text-pulse-muted">
        Step {step + 1} of 3 · {stepTitles[step]}
      </p>

      {step === 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-pulse-muted">
            Registers a mock signer address for this adapter. Production flow calls the adapter registry onchain.
          </p>
          {bindingAddress ? (
            <p className="font-mono text-xs text-base-content">{bindingAddress}</p>
          ) : null}
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-4">
          <p className="text-xs leading-relaxed text-pulse-muted">{KEY_STORAGE_NOTE}</p>
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
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          <p className="text-sm text-pulse-muted">
            Authorize <span className="font-mono text-xs">{bindingAddress}</span> on your Pulse profile with the
            weight below.
          </p>
          {entry.isDecisionLayer ? (
            <p className="text-sm text-pulse-muted">
              Decision-layer adapters use weight 0 — they gate evaluation, not threshold accumulation.
            </p>
          ) : (
            <NumberField
              label="Signal weight"
              unit="points"
              value={weight}
              onChange={setWeight}
            />
          )}
        </div>
      ) : null}
    </PulseModal>
  );
};
