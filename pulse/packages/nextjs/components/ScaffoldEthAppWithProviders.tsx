"use client";

import { useEffect, useState } from "react";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { AppLayout } from "~~/components/pulse/layout/AppLayout";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useTheme } from "~~/components/ThemeProvider";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const rainbowKitThemeOptions = {
  accentColor: "#4C66FF",
  accentColorForeground: "#F8F6FF",
  borderRadius: "large" as const,
  fontStack: "system" as const,
};

const RainbowKitWithTheme = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const theme =
    mounted && resolvedTheme === "dark"
      ? darkTheme(rainbowKitThemeOptions)
      : lightTheme(rainbowKitThemeOptions);

  return (
    <RainbowKitProvider avatar={BlockieAvatar} theme={theme}>
      <ProgressBar height="3px" color="#4C66FF" />
      {children}
    </RainbowKitProvider>
  );
};

export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitWithTheme>
          <AppLayout>{children}</AppLayout>
        </RainbowKitWithTheme>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
