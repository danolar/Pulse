"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import type { VoiceConnectionPublic } from "~~/services/voice";
import { usePulseStore } from "~~/services/store/pulseStore";
import { notification } from "~~/utils/scaffold-eth/notification";

const TWILIO_VERIFIED_CALLER_IDS_URL =
  "https://console.twilio.com/us1/develop/phone-numbers/manage/verified";

type VoiceAgentConnectProps = {
  moduleEnabled: boolean;
  onLinkedChange?: (linked: boolean) => void;
};

type TestCallState = {
  attemptId: string;
  checkInCode: string;
} | null;

export const VoiceAgentConnect = ({ moduleEnabled, onLinkedChange }: VoiceAgentConnectProps) => {
  const { address, isConnected } = useAccount();
  const [connection, setConnection] = useState<VoiceConnectionPublic | null>(null);
  const [phoneInput, setPhoneInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [testCall, setTestCall] = useState<TestCallState>(null);

  const loadConnection = useCallback(async () => {
    if (!address) {
      setConnection(null);
      onLinkedChange?.(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/voice/connection?profileOwner=${encodeURIComponent(address)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load voice connection.");
      }

      setConnection(data);
      onLinkedChange?.(Boolean(data.connected));
      if (data.connected) {
        usePulseStore.getState().ensureModuleEnabled("twilio-voice");
      }
    } catch (error) {
      setConnection(null);
      onLinkedChange?.(false);
      if (moduleEnabled) {
        notification.error(error instanceof Error ? error.message : "Failed to load voice connection.");
      }
    } finally {
      setLoading(false);
    }
  }, [address, moduleEnabled, onLinkedChange]);

  useEffect(() => {
    void loadConnection();
  }, [loadConnection]);

  const handleSavePhone = async () => {
    if (!moduleEnabled) {
      notification.error("Enable Voice agent first, then link your phone.");
      return;
    }
    if (!isConnected || !address) {
      notification.error("Connect your wallet first, then link your phone.");
      return;
    }
    if (!phoneInput.trim()) {
      notification.error("Enter your phone number in international format (e.g. +14155552671).");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/voice/connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileOwner: address, phoneNumber: phoneInput.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to save phone number.");

      setConnection(data);
      notification.success(data.message ?? "Phone saved.");
    } catch (error) {
      notification.error(error instanceof Error ? error.message : "Failed to save phone number.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!address) return;

    setLoading(true);
    try {
      const response = await fetch("/api/voice/connection/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileOwner: address }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to check verification.");

      if (data.verified) {
        setConnection(data);
        onLinkedChange?.(true);
        usePulseStore.getState().ensureModuleEnabled("twilio-voice");
        notification.success("Phone verified and linked.");
      } else {
        notification.error(data.message ?? "Not verified yet.");
      }
    } catch (error) {
      notification.error(error instanceof Error ? error.message : "Failed to check verification.");
    } finally {
      setLoading(false);
    }
  };

  const handleTestCall = async () => {
    if (!address) return;

    setLoading(true);
    setTestCall(null);
    try {
      const response = await fetch("/api/voice/test-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileOwner: address }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to place test call.");

      setTestCall({ attemptId: data.attemptId, checkInCode: data.checkInCode });
      notification.success(data.message ?? "Test call started.");
    } catch (error) {
      notification.error(error instanceof Error ? error.message : "Failed to place test call.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!address) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/voice/connection?profileOwner=${encodeURIComponent(address)}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to disconnect.");

      setConnection(null);
      setTestCall(null);
      onLinkedChange?.(false);
      notification.success("Phone disconnected.");
    } catch (error) {
      notification.error(error instanceof Error ? error.message : "Failed to disconnect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 space-y-3 border-t border-base-content/10 pt-3" onClick={event => event.stopPropagation()}>
      {!moduleEnabled && !connection?.connected ? (
        <p className="text-xs text-pulse-muted">Enable this module to link your phone for voice check-ins.</p>
      ) : null}

      {!isConnected ? (
        <p className="text-xs text-pulse-muted">Connect your wallet in the header, then link your phone.</p>
      ) : connection?.connected ? (
        <>
          <p className="text-xs font-medium text-success">Linked · {connection.phoneMasked}</p>
          {testCall ? (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 px-3 py-2">
              <p className="pulse-label mb-1">Test check-in code</p>
              <p className="font-mono text-2xl tracking-[0.3em] text-base-content">{testCall.checkInCode}</p>
              <p className="mt-1 text-xs text-pulse-muted">Enter this code on your phone keypad when Pulse calls.</p>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <PulseButton variant="primary" disabled={loading} onClick={() => void handleTestCall()}>
              Test call
            </PulseButton>
            <PulseButton variant="secondary" disabled={loading} onClick={() => void handleDisconnect()}>
              Disconnect
            </PulseButton>
          </div>
        </>
      ) : connection?.verificationPending ? (
        <>
          <p className="text-xs text-pulse-muted">
            Twilio trial: verify {connection.phoneMasked ?? "your number"} in the console, then check here.
          </p>
          <ol className="list-decimal space-y-1 pl-4 text-xs text-pulse-muted">
            <li>
              Open{" "}
              <a
                href={TWILIO_VERIFIED_CALLER_IDS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary"
              >
                Twilio Verified Caller IDs
              </a>
            </li>
            <li>Add a new Caller ID with the same number you saved below</li>
            <li>Complete Twilio&apos;s SMS or call verification</li>
            <li>Return here and click Check verification</li>
          </ol>
          <input
            className="input input-bordered input-sm w-full rounded-2xl"
            placeholder="+1 415 555 2671"
            value={phoneInput}
            onChange={event => setPhoneInput(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <PulseButton variant="primary" disabled={loading} onClick={() => void handleCheckVerification()}>
              Check verification
            </PulseButton>
            <PulseButton variant="secondary" disabled={loading || !phoneInput.trim()} onClick={() => void handleSavePhone()}>
              Update number
            </PulseButton>
          </div>
        </>
      ) : (
        <>
          <p className="text-xs text-pulse-muted">
            On Twilio trial, verify your number in the Twilio Console first, then link it here for voice check-ins.
          </p>
          <input
            className="input input-bordered input-sm w-full rounded-2xl"
            placeholder="+1 415 555 2671"
            value={phoneInput}
            onChange={event => setPhoneInput(event.target.value)}
          />
          <PulseButton variant="primary" disabled={loading || !moduleEnabled} onClick={() => void handleSavePhone()}>
            Save phone number
          </PulseButton>
        </>
      )}
    </div>
  );
};
