import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

interface UiContextValue {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const UiContext = createContext<UiContextValue | undefined>(undefined);

export function UiProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = useCallback(() => setIsSidebarCollapsed(prev => !prev), []);

  const value = useMemo(
    () => ({ isSidebarCollapsed, toggleSidebar }),
    [isSidebarCollapsed, toggleSidebar]
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi must be used within UiProvider");
  return ctx;
}


