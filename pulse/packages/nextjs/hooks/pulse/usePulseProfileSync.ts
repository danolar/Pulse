"use client";

import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { loadConsumerPulseSnapshot, saveConsumerPulseSnapshot } from "~~/services/store/pulseProfileStorage";
import { getInitialPulseState, usePulseStore } from "~~/services/store/pulseStore";

const SAVE_DEBOUNCE_MS = 400;

export const usePulseProfileSync = () => {
  const { address } = useAccount();
  const previousAddressRef = useRef<string | null>(null);
  const isHydratingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const syncProfileForWallet = async () => {
      const previousAddress = previousAddressRef.current;

      if (previousAddress && previousAddress !== address) {
        await saveConsumerPulseSnapshot(previousAddress, usePulseStore.getState().exportConsumerSnapshot());
      }

      previousAddressRef.current = address ?? null;
      isHydratingRef.current = true;

      if (!address) {
        usePulseStore.setState(getInitialPulseState());
        isHydratingRef.current = false;
        return;
      }

      const savedSnapshot = await loadConsumerPulseSnapshot(address);
      if (cancelled) return;

      if (savedSnapshot) {
        usePulseStore.getState().importConsumerSnapshot(savedSnapshot);
      } else {
        usePulseStore.setState({
          ...getInitialPulseState(),
          consumerAddress: address,
        });
      }

      isHydratingRef.current = false;
    };

    void syncProfileForWallet();

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
        void saveConsumerPulseSnapshot(address, usePulseStore.getState().exportConsumerSnapshot());
      }, SAVE_DEBOUNCE_MS);
    });

    return () => {
      unsubscribe();
      if (saveTimeout) clearTimeout(saveTimeout);
    };
  }, [address]);
};
