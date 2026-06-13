"use client";

import { useMemo, useState } from "react";
import {
  IDKitRequestWidget,
  type IDKitResult,
  deviceLegacy,
  orbLegacy,
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

type RpContextPayload = {
  rp_id: string;
  nonce: string;
  created_at: number;
  expires_at: number;
  signature: string;
};

const WORLD_ID_ERROR_MESSAGES: Record<string, string> = {
  generic_error: "World ID could not complete verification. Check RP signing key, action registration, and Orb credential.",
  invalid_rp_signature: "Invalid RP signature — set WORLD_RP_SIGNING_KEY from the Developer Portal.",
  unknown_rp: "Unknown relying party — check NEXT_PUBLIC_WORLD_RP_ID.",
  inactive_rp: "Relying party is inactive in the Developer Portal.",
  failed_by_host_app: "Server rejected the proof. Ensure bind/create actions are registered for this profile key.",
  credential_unavailable: "This credential is not available on your World App account (Orb verification requires an Orb identity).",
  max_verifications_reached: "This action reached its verification limit in the Developer Portal.",
  duplicate_nonce: "Verification session expired — try again.",
  user_rejected: "Verification cancelled in World App.",
  verification_rejected: "World App rejected the verification.",
  world_id_4_not_available: "World ID 4.0 is not available for this device — try legacy Orb flow or update World App.",
};

const getAppId = (): `app_${string}` | null => {
  const appId = process.env.NEXT_PUBLIC_WORLD_APP_ID;
  if (!appId || !appId.startsWith("app_")) return null;
  return appId as `app_${string}`;
};

const getWorldIdEnvironment = (): "staging" | "production" =>
  process.env.NEXT_PUBLIC_WORLD_ID_ENVIRONMENT === "production" ? "production" : "staging";

const fetchRpContext = async (action: string): Promise<RpContextPayload> => {
  const response = await fetch("/api/world-id/rp-context", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });

  const body = (await response.json()) as RpContextPayload & { error?: string };
  if (!response.ok) {
    throw new Error(body.error ?? `Failed to sign RP context (HTTP ${response.status}).`);
  }

  return body;
};

const verifyWithWorldApi = async (result: IDKitResult) => {
  const response = await fetch("/api/world-id/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idkitResponse: result }),
  });

  const body = (await response.json()) as { error?: string; detail?: string };
  if (!response.ok) {
    throw new Error(body.detail ?? body.error ?? "World ID verify API rejected the proof.");
  }
};

export const PulseWorldIdButton = ({ level, action, signal, label, disabled, onVerified }: PulseWorldIdButtonProps) => {
  const [open, setOpen] = useState(false);
  const [rpContext, setRpContext] = useState<RpContextPayload | null>(null);
  const [opening, setOpening] = useState(false);
  const appId = getAppId();

  const preset = useMemo(() => {
    if (level === "orb") {
      return orbLegacy({ signal });
    }
    return deviceLegacy({ signal });
  }, [level, signal]);

  const actionDescription =
    level === "device" ? `Pulse · create profile (${signal})` : `Pulse · bind Orb identity (${signal})`;

  const handleMockVerify = () => {
    onVerified({ mock: true, level });
  };

  const handleOpen = async () => {
    if (disabled || opening) return;

    setOpening(true);
    try {
      const context = await fetchRpContext(action);
      setRpContext(context);
      setOpen(true);
    } catch (error) {
      notification.error(error instanceof Error ? error.message : "Could not start World ID verification.");
    } finally {
      setOpening(false);
    }
  };

  const handleProof = (result: IDKitResult) => {
    try {
      const validated = validateWorldIdProof(result, { level, action });
      onVerified(validated);
      setOpen(false);
      setRpContext(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "World ID verification rejected.";
      notification.error(message);
      setOpen(false);
      setRpContext(null);
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
      <PulseButton type="button" disabled={disabled || opening} onClick={handleOpen}>
        {opening ? "Preparing…" : label}
      </PulseButton>
      {rpContext ? (
        <IDKitRequestWidget
          key={rpContext.nonce}
          open={open}
          onOpenChange={nextOpen => {
            setOpen(nextOpen);
            if (!nextOpen) setRpContext(null);
          }}
          app_id={appId}
          action={action}
          action_description={actionDescription}
          allow_legacy_proofs
          environment={getWorldIdEnvironment()}
          preset={preset}
          rp_context={rpContext}
          handleVerify={async result => {
            await verifyWithWorldApi(result);
            validateWorldIdProof(result, { level, action });
          }}
          onSuccess={handleProof}
          onError={errorCode => {
            const message = WORLD_ID_ERROR_MESSAGES[errorCode] ?? `World ID verification failed (${errorCode}).`;
            notification.error(message);
            setOpen(false);
            setRpContext(null);
          }}
        />
      ) : null}
    </>
  );
};
