"use client";

import { useMemo, useState } from "react";
import {
  IDKitRequestWidget,
  type IDKitResult,
  deviceLegacy,
  proofOfHuman,
} from "@worldcoin/idkit";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import { notification } from "~~/utils/scaffold-eth/notification";
import {
  type PulseWorldIdVerification,
  type WorldIdProofLevel,
  validateWorldIdProof,
} from "~~/utils/worldIdProof";

type PulseWorldIdButtonProps = {
  level: WorldIdProofLevel;
  action: string;
  signal: string;
  label: string;
  disabled?: boolean;
  onVerified: (verification: PulseWorldIdVerification) => void;
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

  const preset = useMemo(() => {
    if (level === "orb") {
      return proofOfHuman({ signal });
    }
    return deviceLegacy({ signal });
  }, [level, signal]);

  const handleMockVerify = () => {
    onVerified({ mock: true, level });
  };

  const handleOpen = () => {
    setRpContext(buildMockRpContext());
    setOpen(true);
  };

  const handleProof = (result: IDKitResult) => {
    try {
      const validated = validateWorldIdProof(result, { level, action });
      onVerified(validated);
      setOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "World ID verification rejected.";
      notification.error(message);
      setOpen(false);
    }
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
          handleVerify={async result => {
            validateWorldIdProof(result, { level, action });
          }}
          onSuccess={handleProof}
          onError={errorCode => {
            notification.error(`World ID verification failed (${errorCode}).`);
            setOpen(false);
          }}
        />
      ) : null}
    </>
  );
};
