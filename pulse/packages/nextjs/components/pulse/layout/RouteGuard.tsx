"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectVacant } from "~~/components/pulse/layout/ConnectVacant";
import { usePulseStore } from "~~/services/store/pulseStore";

type RouteGuardProps = {
  children: ReactNode;
  /** When true, redirects to /setup if no profile (mock: setupComplete). */
  requireProfile?: boolean;
};

export const RouteGuard = ({ children, requireProfile = false }: RouteGuardProps) => {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const setupComplete = usePulseStore(state => state.setupComplete);

  useEffect(() => {
    if (!requireProfile || !isConnected) return;
    if (!setupComplete) {
      router.replace("/setup");
    }
  }, [requireProfile, isConnected, setupComplete, router]);

  if (!isConnected || !address) {
    return <ConnectVacant />;
  }

  if (requireProfile && !setupComplete) {
    return null;
  }

  return <>{children}</>;
};
