"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export { useTheme };

export const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => (
  <NextThemesProvider
    attribute="data-theme"
    defaultTheme="system"
    enableSystem
    storageKey="pulse-theme"
    themes={["light", "dark"]}
    {...props}
  >
    {children}
  </NextThemesProvider>
);
