import "@rainbow-me/rainbowkit/styles.css";
import "@scaffold-ui/components/styles.css";
import { Comfortaa, DM_Sans } from "next/font/google";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

const comfortaa = Comfortaa({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-comfortaa",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata = getMetadata({
  title: "pulse",
  description: "Onchain liveness oracle. Is this human still here?",
});

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning className={`${comfortaa.variable} ${dmSans.variable}`}>
      <body suppressHydrationWarning className={dmSans.className}>
        <ThemeProvider>
          <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
