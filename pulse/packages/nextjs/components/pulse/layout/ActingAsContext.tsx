"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { ActingRole } from "~~/types/pulse";

type ActingAsContextValue = {
  actingAs: ActingRole;
  setActingAs: (role: ActingRole) => void;
};

const ActingAsContext = createContext<ActingAsContextValue | null>(null);

export const ActingAsProvider = ({ children }: { children: ReactNode }) => {
  const [actingAs, setActingAsState] = useState<ActingRole>("owner");
  const setActingAs = useCallback((role: ActingRole) => setActingAsState(role), []);

  return <ActingAsContext.Provider value={{ actingAs, setActingAs }}>{children}</ActingAsContext.Provider>;
};

export const useActingAs = (): ActingAsContextValue => {
  const context = useContext(ActingAsContext);
  if (!context) {
    throw new Error("useActingAs must be used within ActingAsProvider");
  }
  return context;
};
