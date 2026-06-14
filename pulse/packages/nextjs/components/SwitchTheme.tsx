"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "~~/components/ThemeProvider";

export const SwitchTheme = ({ className }: { className?: string }) => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const isDarkMode = resolvedTheme === "dark";

  const handleToggle = () => {
    if (!mounted) return;
    setTheme(isDarkMode ? "light" : "dark");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      type="button"
      className={`btn btn-ghost btn-circle btn-sm h-9 min-h-9 w-9 min-w-9 shrink-0 shadow-none ${className ?? ""}`}
      onClick={handleToggle}
      disabled={!mounted}
      aria-label={mounted ? (isDarkMode ? "Switch to light mode" : "Switch to dark mode") : "Theme toggle"}
    >
      {mounted ? (
        isDarkMode ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )
      ) : (
        <Moon className="h-5 w-5 opacity-0" aria-hidden />
      )}
    </button>
  );
};
