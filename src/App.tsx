import React, { useEffect } from "react";
import { Routes, Route, useNavigate, Outlet } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { RootProviders } from "./context/RootProviders";
import AppSidebar from "./components/AppSidebar";
import MainContent from "./components/MainContent";
import PageDetail from "./components/PageDetail";
import AuthComponent from "./components/Auth";
import { LoaderCircle } from "lucide-react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "./components/ui/sidebar";
import { ThemeProvider } from "./context/ThemeContext";
import { ModeToggle } from "./components/ui/mode-toggle";
import { PageNavigationSync } from "./components/PageNavigationSync";
import { TemplateNavigationSync } from "./components/TemplateNavigationSync";
import RoadmapTemplate from "./components/templates/RoadmapTemplate";
import CalendarTemplate from "./components/templates/CalendarTemplate";

const AppLayout: React.FC = () => {
  const { isLoading, user } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [isLoading, user, navigate]);

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

  if (!user) {
    return null; // or a minimal loading state, as navigation will occur
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <PageNavigationSync />
      <TemplateNavigationSync />
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <ModeToggle />
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
};

const App: React.FC = () => {
  return (
    <RootProviders>
      <AppProvider>
        <ThemeProvider defaultTheme="system" storageKey="worknest-theme">
          <Routes>
            <Route path="/login" element={<AuthComponent />} />
            <Route path="/" element={<AppLayout />}>
              <Route index element={<MainContent />} />
              <Route path="page/:slug" element={<PageDetail />} />
              <Route path="templates">
                <Route path="roadmap" element={<RoadmapTemplate />} />
                <Route path="calendar" element={<CalendarTemplate />} />
              </Route>
            </Route>
          </Routes>
        </ThemeProvider>
      </AppProvider>
    </RootProviders>
  );
};

export default App;
