import React, { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import AppSidebar from "./components/AppSidebar";
import MainContent from "./components/MainContent";
import AuthComponent from "./components/Auth";
import { LoaderCircle } from "lucide-react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "./components/ui/sidebar";
import { ThemeProvider } from "./context/ThemeContext";
import { ModeToggle } from "./components/ui/mode-toggle";

const AppContent: React.FC = () => {
  const { isLoading, session } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !session) {
      navigate("/login");
    }
  }, [isLoading, session, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <LoaderCircle className="animate-spin text-primary" size={48} />
          <p className="text-muted-foreground">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // or a minimal loading state, as navigation will occur
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <ModeToggle />
        </header>
        <MainContent />
      </SidebarInset>
    </SidebarProvider>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <ThemeProvider defaultTheme="system" storageKey="worknest-theme">
        <Routes>
          <Route path="/login" element={<AuthComponent />} />
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </ThemeProvider>
    </AppProvider>
  );
};

export default App;
