"use client";

import { useMemo, useState } from "react";
import { IDKitRequestWidget, type IDKitResult, deviceLegacy, orbLegacy } from "@worldcoin/idkit";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";

type PulseWorldIdButtonProps = {
  level: "device" | "orb";
  action: string;
  signal: string;
  label: string;
  disabled?: boolean;
  onVerified: (result?: IDKitResult | { mock: true }) => void;
};

const getAppId = (): `app_${string}` | null => {
  const appId = process.env.NEXT_PUBLIC_WORLD_APP_ID;
  if (!appId || !appId.startsWith("app_")) return null;
  return appId as `app_${string}`;
};

const buildMockRpContext = () => {
  const now = Math.floor(Date.now() / 1000);
  return {
    rp_id: process.env.NEXT_PUBLIC_WORLD_RP_ID ?? "rp_pulse_dev",
    nonce: crypto.randomUUID(),
    created_at: now,
    expires_at: now + 300,
    signature: "0xmock",
  };
};

export const PulseWorldIdButton = ({ level, action, signal, label, disabled, onVerified }: PulseWorldIdButtonProps) => {
  const [open, setOpen] = useState(false);
  const [rpContext, setRpContext] = useState<ReturnType<typeof buildMockRpContext> | null>(null);
  const appId = getAppId();

  const preset = useMemo(() => (level === "orb" ? orbLegacy({ signal }) : deviceLegacy({ signal })), [level, signal]);

  const handleMockVerify = () => {
    onVerified({ mock: true });
  };

  const handleOpen = () => {
    setRpContext(buildMockRpContext());
    setOpen(true);
  };

  if (!appId) {
    return (
      <PulseButton type="button" disabled={disabled} onClick={handleMockVerify}>
        {label}
      </PulseButton>
    );
  }

  return (
    <>
      <PulseButton type="button" disabled={disabled} onClick={handleOpen}>
        {label}
      </PulseButton>
      {rpContext ? (
        <IDKitRequestWidget
          open={open}
          onOpenChange={setOpen}
          app_id={appId}
          action={action}
          allow_legacy_proofs
          environment="staging"
          preset={preset}
          rp_context={rpContext}
          onSuccess={async result => {
            onVerified(result);
            setOpen(false);
          }}
          onError={() => setOpen(false)}
        />
      ) : null}
    </>
  );
};
