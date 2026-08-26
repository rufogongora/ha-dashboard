import React, { createContext, useContext } from "react";
import { useDashboardConfig } from "./dashboardConfig";

type ConfigContextValue = ReturnType<typeof useDashboardConfig>;

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const value = useDashboardConfig();
  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig(): ConfigContextValue {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfig must be used within a ConfigProvider");
  return ctx;
}
