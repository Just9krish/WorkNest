import React, { createContext, useContext, ReactNode } from "react";
import {
  Block,
  CalendarEvent,
  Page,
  Profile,
  RoadmapTask,
  Template,
  Workspace,
} from "../types";
import { useAuth } from "./auth-context";
import { useUi } from "./ui-context";
import { usePages } from "./pages-context";
import { useBlocks } from "./blocks-context";
import { useRoadmap } from "./roadmap-context";
import { useCalendar } from "./calendar-context";
import { useTemplates } from "./templates-context";
import { Models } from "appwrite";

// Legacy aggregator only

interface AppContextType {
  user: Models.User<Models.Preferences> | null;
  profile: Profile | null;
  workspace: Workspace | null;
  pages: Page[];
  blocks: Block[];
  templates: Template[];
  selectedPageId: string | null;
  selectedTemplateId: string | null;
  roadmapTasks: RoadmapTask[];
  calendarEvents: CalendarEvent[];
  isSidebarCollapsed: boolean;
  isLoading: boolean;
  addPage: (parentId?: string) => Promise<void>;
  deletePage: (pageId: string) => Promise<void>;
  selectPage: (pageId: string | null) => void;
  selectTemplate: (templateId: string | null) => void;
  togglePageExpansion: (pageId: string) => void;
  updatePage: (
    pageId: string,
    updates: Partial<Omit<Page, "id" | "userId" | "createdAt">>
  ) => Promise<void>;
  toggleSidebar: () => void;
  getPageBlocks: (pageId: string) => Block[];
  getChildBlocks: (parentBlockId: string) => Block[];
  addBlock: (
    pageId: string,
    afterBlockId?: string,
    parentBlockId?: string
  ) => Promise<Block>;
  updateBlock: (blockId: string, updates: Partial<Block>) => Promise<void>;
  deleteBlock: (blockId: string) => Promise<void>;
  toggleBlockExpansion: (blockId: string) => void;
  addRoadmapTask: (
    task: Omit<RoadmapTask, "id" | "userId" | "createdAt">
  ) => Promise<void>;
  updateRoadmapTask: (
    taskId: string,
    updates: Partial<RoadmapTask>
  ) => Promise<void>;
  deleteRoadmapTask: (taskId: string) => Promise<void>;
  addCalendarEvent: (
    event: Omit<CalendarEvent, "id" | "userId" | "createdAt">
  ) => Promise<void>;
  updateCalendarEvent: (
    eventId: string,
    updates: Partial<CalendarEvent>
  ) => Promise<void>;
  deleteCalendarEvent: (eventId: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Compose from modular contexts
  const { user, profile, workspace, isAuthLoading, signOut } = useAuth();
  const { isSidebarCollapsed, toggleSidebar } = useUi();
  const {
    pages,
    selectedPageId,
    selectPage,
    addPage,
    updatePage,
    deletePage,
    togglePageExpansion,
  } = usePages();
  const {
    blocks,
    getPageBlocks,
    getChildBlocks,
    addBlock,
    updateBlock,
    deleteBlock,
    toggleBlockExpansion,
  } = useBlocks();
  const { roadmapTasks } = useRoadmap();
  const {
    calendarEvents,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
  } = useCalendar();
  const { templates, selectedTemplateId, selectTemplate } = useTemplates();

  const isLoading = isAuthLoading; // Extend later if needed

  return (
    <AppContext.Provider
      value={{
        user,
        profile,
        workspace,
        pages,
        blocks,
        templates,
        selectedPageId,
        selectedTemplateId,
        roadmapTasks,
        calendarEvents,
        isSidebarCollapsed,
        isLoading,
        addPage,
        deletePage,
        selectPage,
        selectTemplate,
        togglePageExpansion,
        updatePage,
        toggleSidebar,
        getPageBlocks,
        getChildBlocks,
        addBlock,
        updateBlock,
        deleteBlock,
        toggleBlockExpansion,
        addRoadmapTask: async () => {},
        updateRoadmapTask: async () => {},
        deleteRoadmapTask: async () => {},
        addCalendarEvent,
        updateCalendarEvent,
        deleteCalendarEvent,
        signOut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined)
    throw new Error("useApp must be used within an AppProvider");
  return context;
};
