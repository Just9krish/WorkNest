import React from "react";
import { AuthProvider } from "./auth-context";
import { UiProvider } from "./ui-context";
import { PagesProvider } from "./pages-context";
import { BlocksProvider } from "./blocks-context";
import { RoadmapProvider } from "./roadmap-context";
import { CalendarProvider } from "./calendar-context";
import { TemplatesProvider } from "./templates-context";
import { AlertDialogProvider } from "./alert-dialog-context";

export function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <UiProvider>
        <AlertDialogProvider>
          <TemplatesProvider>
            <PagesProvider>
              <BlocksProvider>
                <RoadmapProvider>
                  <CalendarProvider>{children}</CalendarProvider>
                </RoadmapProvider>
              </BlocksProvider>
            </PagesProvider>
          </TemplatesProvider>
        </AlertDialogProvider>
      </UiProvider>
    </AuthProvider>
  );
}
