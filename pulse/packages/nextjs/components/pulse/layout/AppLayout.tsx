"use client";

import { useState, type ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { Footer } from "~~/components/Footer";
import { DevFloatingBar } from "~~/components/pulse";
import { ConnectionKitPanel } from "~~/components/pulse/layout/ConnectionKitPanel";
import { TopBar } from "~~/components/pulse/layout/TopBar";
import { PulseProfileSync } from "~~/components/pulse/PulseProfileSync";
import { SHOW_SCAFFOLD_DEV_UI } from "~~/constants/pulseAppConfig";

type AppLayoutProps = {
  children: ReactNode;
};

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [connectionKitOpen, setConnectionKitOpen] = useState(false);

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <PulseProfileSync />
        <TopBar onOpenConnectionKit={() => setConnectionKitOpen(true)} />
        <main className={`relative flex flex-1 flex-col ${SHOW_SCAFFOLD_DEV_UI ? "pb-24" : "pb-6"}`}>
          {children}
        </main>
        <Footer />
        <DevFloatingBar />
        <ConnectionKitPanel open={connectionKitOpen} onClose={() => setConnectionKitOpen(false)} />
      </div>
      <Toaster />
    </>
  );
};
