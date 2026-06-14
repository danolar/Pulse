"use client";

import * as React from "react";

type ThemeContextValue = {
  theme: string;
  setTheme: (theme: string | ((theme: string) => string)) => void;
  forcedTheme?: string;
  resolvedTheme?: string;
  themes: string[];
  systemTheme?: string;
};

const ThemeContext = React.createContext<ThemeContextValue>({
  theme: "light",
  setTheme: () => {},
  resolvedTheme: "light",
  themes: ["light"],
});

export const useTheme = () => React.useContext(ThemeContext);

type ThemeProviderProps = {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  forcedTheme?: string;
  enableSystem?: boolean;
  storageKey?: string;
};

export const ThemeProvider = ({
  children,
  attribute = "data-theme",
  forcedTheme = "light",
}: ThemeProviderProps) => {
  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme: forcedTheme,
      setTheme: () => {},
      forcedTheme,
      resolvedTheme: forcedTheme,
      themes: [forcedTheme],
    }),
    [forcedTheme],
  );

  React.useEffect(() => {
    document.documentElement.setAttribute(attribute, forcedTheme);
  }, [attribute, forcedTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
