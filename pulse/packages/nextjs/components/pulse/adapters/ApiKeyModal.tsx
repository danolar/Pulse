"use client";

import { useState } from "react";
import { PulseModal } from "~~/components/pulse/modals/PulseModal";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import { KEY_STORAGE_NOTE } from "~~/constants/explorerCopy";
import { getCatalogEntry } from "~~/constants/adapterCatalog";
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
      title={`Keys · ${adapter.name}`}
      onClose={onClose}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <PulseButton variant="ghost" onClick={onClose}>
            Cancel
          </PulseButton>
          <PulseButton variant="secondary" onClick={handleRevoke}>
            Revoke on profile (mock)
          </PulseButton>
          <PulseButton onClick={handleRotate}>Rotate keys (mock)</PulseButton>
        </div>
      }
    >
      <p className="mb-4 text-xs leading-relaxed text-pulse-muted">{KEY_STORAGE_NOTE}</p>

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
    </PulseModal>
  );
};
