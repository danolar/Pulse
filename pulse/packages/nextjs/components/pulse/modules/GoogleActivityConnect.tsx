"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { PulseButton } from "~~/components/pulse/ui/PulseButton";
import type { GoogleConnectionPublic } from "~~/services/google";
import { usePulseStore } from "~~/services/store/pulseStore";
import { notification } from "~~/utils/scaffold-eth/notification";

type GoogleActivityConnectProps = {
  moduleEnabled: boolean;
  refreshToken?: number;
  onLinkedChange?: (linked: boolean, email?: string | null) => void;
};

export const GoogleActivityConnect = ({
  moduleEnabled,
  refreshToken = 0,
  onLinkedChange,
}: GoogleActivityConnectProps) => {
  const { address, isConnected } = useAccount();
  const [connection, setConnection] = useState<GoogleConnectionPublic | null>(null);
  const [loading, setLoading] = useState(false);

  const loadConnection = useCallback(async () => {
    if (!address) {
      setConnection(null);
      onLinkedChange?.(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/google/connection?profileOwner=${encodeURIComponent(address)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load Google connection.");
      }

      if (data.connected) {
        setConnection(data);
        onLinkedChange?.(true, data.googleEmail);
        usePulseStore.getState().ensureModuleEnabled("google-activity");
      } else {
        setConnection(null);
        onLinkedChange?.(false);
      }
    } catch (error) {
      setConnection(null);
      onLinkedChange?.(false);
      const message = error instanceof Error ? error.message : "Failed to load Google connection.";
      if (moduleEnabled) {
        notification.error(message);
      }
    } finally {
      setLoading(false);
    }
  }, [address, moduleEnabled, onLinkedChange]);

  useEffect(() => {
    void loadConnection();
  }, [loadConnection, refreshToken]);

  const handleConnect = () => {
    if (!moduleEnabled) {
      notification.error("Enable Google activity first, then connect your account.");
      return;
    }

    if (!isConnected || !address) {
      notification.error("Connect your wallet first, then link Google.");
      return;
    }

    const surfaces = "gmailSend,gmailReceive,calendar,drive";
    window.location.href = `/api/google/oauth/start?profileOwner=${encodeURIComponent(address)}&surfaces=${surfaces}`;
  };

  const handleDisconnect = async () => {
    if (!address) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/google/connection?profileOwner=${encodeURIComponent(address)}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to disconnect Google.");
      }

      setConnection(null);
      onLinkedChange?.(false);
      notification.success("Google account disconnected.");
    } catch (error) {
      notification.error(error instanceof Error ? error.message : "Failed to disconnect Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 space-y-2 border-t border-base-content/10 pt-3" onClick={event => event.stopPropagation()}>
      {!moduleEnabled && !connection?.connected ? (
        <p className="text-xs text-pulse-muted">Enable this module to connect Google activity signals.</p>
      ) : null}

      {!isConnected ? (
        <p className="text-xs text-pulse-muted">Connect your wallet in the header, then link your Google account.</p>
      ) : connection?.connected ? (
        <>
          <p className="text-xs font-medium text-success">Linked as {connection.googleEmail ?? "Google account"}</p>
          <PulseButton variant="secondary" disabled={loading} onClick={() => void handleDisconnect()}>
            Disconnect Google
          </PulseButton>
        </>
      ) : (
        <>
          <p className="text-xs text-pulse-muted">
            Grant read-only access to Gmail, Calendar, and Drive activity signals.
          </p>
          <PulseButton variant="primary" disabled={loading || !moduleEnabled} onClick={handleConnect}>
            Connect Google
          </PulseButton>
        </>
      )}
    </div>
  );
};
