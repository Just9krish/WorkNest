import React from "react";
import { AuthProvider } from "./auth-context";
import { UiProvider } from "./ui-context";
import { PagesProvider } from "./pages-context";
import { BlocksProvider } from "./blocks-context";
import { RoadmapProvider } from "./roadmap-context";
import { CalendarProvider } from "./calendar-context";
import { TemplatesProvider } from "./templates-context";

export function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <UiProvider>
        <TemplatesProvider>
          <PagesProvider>
            <BlocksProvider>
              <RoadmapProvider>
                <CalendarProvider>{children}</CalendarProvider>
              </RoadmapProvider>
            </BlocksProvider>
          </PagesProvider>
        </TemplatesProvider>
      </UiProvider>
    </AuthProvider>
  );
}


