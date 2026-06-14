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

const CAPABILITY_OPTIONS: AdapterCatalogEntry["capabilities"][] = ["life", "inactivity", "both"];

export const AdapterSetupFlow = ({ entry, onClose, onComplete }: AdapterSetupFlowProps) => {
  const [step, setStep] = useState(0);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [weight, setWeight] = useState(entry?.suggestedWeight ?? 10);
  const [capabilities, setCapabilities] = useState<AdapterCatalogEntry["capabilities"]>(
    entry?.capabilities ?? "both",
  );

  if (!entry) return null;

  const resetAndClose = () => {
    setStep(0);
    setFieldValues({});
    setWeight(entry.suggestedWeight);
    setCapabilities(entry.capabilities);
    onClose();
  };

  const adapterAddress = entry.adapterAddress?.trim() ? entry.adapterAddress : mockSignerAddress(entry.id);

  const handleConfirm = () => {
    onComplete({
      catalogId: entry.id,
      name: entry.name,
      typeLabel: entry.typeLabel,
      adapterAddress,
      weight: entry.isDecisionLayer ? 0 : weight,
      capabilities,
      isDecisionLayer: entry.isDecisionLayer,
    });
    resetAndClose();
  };

  const stepTitles = ["API credentials", "Weight", "Capabilities", "Confirm"];

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
          {step < 3 ? (
            <PulseButton onClick={() => setStep(step + 1)}>{step === 2 ? "Review" : "Continue"}</PulseButton>
          ) : (
            <PulseButton onClick={handleConfirm}>Save configuration</PulseButton>
          )}
        </div>
      }
    >
      <p className="mb-4 text-xs text-pulse-muted">
        Step {step + 1} of 4 · {stepTitles[step]}
      </p>

      {step === 0 ? (
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

      {step === 1 ? (
        <div className="space-y-4">
          {entry.isDecisionLayer ? (
            <p className="text-sm text-pulse-muted">
              Decision-layer adapters use weight 0 — they gate evaluation, not threshold accumulation.
            </p>
          ) : (
            <>
              <p className="text-sm text-pulse-muted">
                The adapter suggests {entry.suggestedWeight}. Adjust how much this source counts when activated on a
                profile in Setup.
              </p>
              <NumberField label="Suggested weight" unit="points" value={weight} onChange={setWeight} />
            </>
          )}
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-3">
          {entry.isDecisionLayer ? (
            <p className="text-sm text-pulse-muted">
              This adapter decides whether evaluation requests are approved. It does not contribute weight.
            </p>
          ) : (
            <>
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
            </>
          )}
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-3 text-sm">
          <p className="text-pulse-muted">
            Saves adapter credentials for your consumer context. Activate on a profile in Setup — not here.
          </p>
          <dl className="space-y-2 rounded-2xl border border-base-content/10 p-4">
            <div className="flex justify-between gap-4">
              <dt className="text-pulse-muted">Adapter</dt>
              <dd>{entry.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-pulse-muted">Signer</dt>
              <dd className="font-mono text-xs">{adapterAddress}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-pulse-muted">Weight</dt>
              <dd>{entry.isDecisionLayer ? 0 : weight}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-pulse-muted">Capabilities</dt>
              <dd>{capabilities}</dd>
            </div>
          </dl>
        </div>
      ) : null}
    </PulseModal>
  );
};
