"use client";

import { useMemo } from "react";
import type { Hex } from "viem";
import { computeOnchainProfileId, isPulseOnchainEnabled } from "~~/hooks/pulse/usePulseOracleActions";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import type { ConsoleSignal, PublicThresholdEvent, PulseOnchainEvent } from "~~/types/pulse";
import {
  mapOnchainEventsToConsoleSignals,
  mapOnchainThresholdEvents,
  mergeOnchainEvents,
  parseSignalReportedLogs,
  parseThresholdReachedLogs,
  parseWeightResetLogs,
} from "~~/utils/pulseOnchainEvents";

type UsePulseOnchainEventsParams = {
  profileId?: Hex | string | null;
  ownerAddress?: string | null;
  consumerAddress?: string | null;
  enabled?: boolean;
  watch?: boolean;
};

export type PulseOnchainEventsResult = {
  profileId: Hex | null;
  events: PulseOnchainEvent[];
  weightResetEvents: PulseOnchainEvent[];
  consoleSignals: ConsoleSignal[];
  thresholdEvents: PublicThresholdEvent[];
  isLoading: boolean;
  isEnabled: boolean;
  error: Error | null;
};

export const usePulseOnchainEvents = (params: UsePulseOnchainEventsParams): PulseOnchainEventsResult => {
  const isEnabled =
    params.enabled !== false && isPulseOnchainEnabled() && Boolean(params.profileId || (params.ownerAddress && params.consumerAddress));

  const profileId = useMemo((): Hex | null => {
    if (params.profileId) return params.profileId as Hex;
    if (params.ownerAddress && params.consumerAddress) {
      return computeOnchainProfileId(params.ownerAddress, params.consumerAddress);
    }
    return null;
  }, [params.profileId, params.ownerAddress, params.consumerAddress]);

  const filters = profileId ? { profileId } : undefined;
  const queryEnabled = isEnabled && Boolean(profileId);

  const signalReported = useScaffoldEventHistory({
    contractName: "PulseOracleV2",
    eventName: "SignalReported",
    filters,
    enabled: queryEnabled,
    watch: params.watch ?? true,
  });

  const thresholdReached = useScaffoldEventHistory({
    contractName: "PulseOracleV2",
    eventName: "ThresholdReached",
    filters,
    enabled: queryEnabled,
    watch: params.watch ?? true,
  });

  const weightReset = useScaffoldEventHistory({
    contractName: "PulseOracleV2",
    eventName: "WeightReset",
    filters,
    enabled: queryEnabled,
    watch: params.watch ?? true,
  });

  const profileIdValue = profileId ?? "0x";

  const events = useMemo(
    () =>
      mergeOnchainEvents(
        parseSignalReportedLogs(signalReported.data as never, profileIdValue),
        parseThresholdReachedLogs(thresholdReached.data as never, profileIdValue),
      ),
    [profileIdValue, signalReported.data, thresholdReached.data],
  );

  const weightResetEvents = useMemo(
    () => parseWeightResetLogs(weightReset.data as never, profileIdValue),
    [profileIdValue, weightReset.data],
  );

  const consoleSignals = useMemo(
    () => mapOnchainEventsToConsoleSignals(events, { ownerAddress: params.ownerAddress }),
    [events, params.ownerAddress],
  );

  const thresholdEvents = useMemo(() => mapOnchainThresholdEvents(events), [events]);

  const isLoading = signalReported.isLoading || thresholdReached.isLoading || weightReset.isLoading;
  const error = (signalReported.error ?? thresholdReached.error ?? weightReset.error) as Error | null;

  return {
    profileId,
    events,
    weightResetEvents,
    consoleSignals,
    thresholdEvents,
    isLoading,
    isEnabled,
    error,
  };
};
