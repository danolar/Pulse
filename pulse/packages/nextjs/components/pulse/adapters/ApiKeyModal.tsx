"use client";

import { useState } from "react";
import { PulseModal } from "~~/components/pulse/modals/PulseModal";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import { getCatalogEntry } from "~~/constants/adapterCatalog";
import { INTERNAL_ADAPTER_PROVIDERS, isInternalAdapterId } from "~~/constants/internalAdapters";
import type { ConfiguredAdapter } from "~~/types/pulse";

type ApiKeyModalProps = {
  adapter: ConfiguredAdapter | null;
  onClose: () => void;
  onRotate: (catalogId: string) => void;
  onRevoke: (catalogId: string) => void;
};

export const ApiKeyModal = ({ adapter, onClose, onRotate, onRevoke }: ApiKeyModalProps) => {
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  if (!adapter) return null;

  const catalogEntry = getCatalogEntry(adapter.catalogId);
  const isInternal = catalogEntry?.isInternal === true;
  const provider =
    isInternal && isInternalAdapterId(adapter.catalogId)
      ? INTERNAL_ADAPTER_PROVIDERS[adapter.catalogId]
      : null;
  const fields = catalogEntry?.dataPlaneFields ?? [];

  const handleRotate = () => {
    onRotate(adapter.catalogId);
    setFieldValues({});
    onClose();
  };

  const handleRevoke = () => {
    onRevoke(adapter.catalogId);
    onClose();
  };

  return (
    <PulseModal
      open={Boolean(adapter)}
      title={isInternal ? adapter.name : `Keys · ${adapter.name}`}
      onClose={onClose}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <PulseButton variant="ghost" onClick={onClose}>
            {isInternal ? "Close" : "Cancel"}
          </PulseButton>
          {!isInternal ? (
            <>
              <PulseButton variant="secondary" onClick={handleRevoke}>
                Revoke on profile (mock)
              </PulseButton>
              <PulseButton onClick={handleRotate}>Rotate keys (mock)</PulseButton>
            </>
          ) : null}
        </div>
      }
    >
      <p className="mb-4 text-xs leading-relaxed text-pulse-muted">
        {isInternal
          ? `${provider?.name ?? "Pulse"} hosts this adapter. No consumer API keys — authorize the signer on each profile.`
          : "Keys go directly to the adapter service. Pulse never stores them."}
      </p>

      {isInternal ? (
        <dl className="space-y-2 rounded-2xl border border-base-content/10 p-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-pulse-muted">Signer</dt>
            <dd className="font-mono text-xs">{adapter.adapterAddress}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-pulse-muted">Weight</dt>
            <dd>{adapter.weight}</dd>
          </div>
        </dl>
      ) : (
        <div className="space-y-4">
          {fields.map(field => (
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
      )}
    </PulseModal>
  );
};
