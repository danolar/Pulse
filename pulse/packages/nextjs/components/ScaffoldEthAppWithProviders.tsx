"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { AppLayout } from "~~/components/pulse/layout/AppLayout";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          avatar={BlockieAvatar}
          theme={lightTheme({
            accentColor: "#4C66FF",
            accentColorForeground: "#F8F6FF",
            borderRadius: "large",
            fontStack: "system",
          })}
        >
          <ProgressBar height="3px" color="#4C66FF" />
          <AppLayout>{children}</AppLayout>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
