"use client";

import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { loadConsumerConfig, saveConsumerConfig } from "~~/services/store/consumerConfigStorage";
import {
  loadRuntimeSnapshotLocal,
  saveRuntimeSnapshotLocal,
} from "~~/services/store/runtimeProfileStorage";
import { getInitialPulseState, usePulseStore } from "~~/services/store/pulseStore";

const SAVE_DEBOUNCE_MS = 400;

export const usePulseProfileSync = () => {
  const { address } = useAccount();
  const previousAddressRef = useRef<string | null>(null);
  const isHydratingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const syncForWallet = async () => {
      const previousAddress = previousAddressRef.current;

      if (previousAddress && previousAddress !== address) {
        await saveConsumerConfig(previousAddress, usePulseStore.getState().exportConsumerConfig());
        const runtime = usePulseStore.getState().exportConsumerSnapshot();
        saveRuntimeSnapshotLocal(previousAddress, {
          profiles: runtime.profiles,
          activeProfileId: runtime.activeProfileId,
          publicSignalsByOwner: runtime.publicSignalsByOwner,
        });
      }

      previousAddressRef.current = address ?? null;
      isHydratingRef.current = true;

      if (!address) {
        usePulseStore.setState(getInitialPulseState());
        isHydratingRef.current = false;
        return;
      }

      const [consumerConfig, runtimeSnapshot] = await Promise.all([
        loadConsumerConfig(address),
        Promise.resolve(loadRuntimeSnapshotLocal(address)),
      ]);

      if (cancelled) return;

      usePulseStore.getState().importConsumerConfig(consumerConfig);

      if (runtimeSnapshot) {
        usePulseStore.setState(state => ({
          profiles: runtimeSnapshot.profiles,
          activeProfileId: runtimeSnapshot.activeProfileId,
          publicSignalsByOwner: runtimeSnapshot.publicSignalsByOwner,
          consumerAddress: address,
          configuredAdapters: state.configuredAdapters,
        }));
      } else {
        usePulseStore.setState(state => ({ ...state, consumerAddress: address }));
      }

      isHydratingRef.current = false;
    };

    void syncForWallet();

    return () => {
      cancelled = true;
    };
  }, [address]);

  useEffect(() => {
    if (!address) return;

    let saveTimeout: ReturnType<typeof setTimeout> | null = null;

    const unsubscribe = usePulseStore.subscribe(() => {
      if (isHydratingRef.current) return;

      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        void saveConsumerConfig(address, usePulseStore.getState().exportConsumerConfig());
        const runtime = usePulseStore.getState().exportConsumerSnapshot();
        saveRuntimeSnapshotLocal(address, {
          profiles: runtime.profiles,
          activeProfileId: runtime.activeProfileId,
          publicSignalsByOwner: runtime.publicSignalsByOwner,
        });
      }, SAVE_DEBOUNCE_MS);
    });

    return () => {
      unsubscribe();
      if (saveTimeout) clearTimeout(saveTimeout);
    };
  }, [address]);
};
