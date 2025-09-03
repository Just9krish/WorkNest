import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  Page,
  Workspace,
  Block,
  Template,
  RoadmapTask,
  CalendarEvent,
  Profile,
} from "../types";
import { supabase } from "../lib/supabase";
import { Session, User } from "@supabase/supabase-js";

const initialTemplates: Template[] = [
  {
    id: "template-roadmap",
    name: "Roadmap",
    icon: "🗺️",
    description: "Plan and track project milestones",
    type: "roadmap",
  },
  {
    id: "template-calendar",
    name: "Calendar",
    icon: "📅",
    description: "Organize events and deadlines",
    type: "calendar",
  },
];

// Helper to convert DB snake_case to frontend camelCase
const pageFromRow = (row: any): Page => ({
  id: row.id,
  createdAt: row.created_at,
  title: row.title,
  icon: row.icon,
  parentId: row.parent_id,
  isExpanded: row.is_expanded,
  userId: row.user_id,
});

const blockFromRow = (row: any): Block => ({
  id: row.id,
  createdAt: row.created_at,
  pageId: row.page_id,
  userId: row.user_id,
  type: row.type,
  content: row.content || "",
  parentBlockId: row.parent_block_id,
  checked: row.checked,
  src: row.src,
  language: row.language,
  isExpanded: row.is_expanded,
});

interface AppContextType {
  session: Session | null;
  user: User | null;
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
  selectTemplate: (templateId: string) => void;
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
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [templates] = useState<Template[]>(initialTemplates);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );
  const [roadmapTasks, setRoadmapTasks] = useState<RoadmapTask[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const dataLoadedRef = useRef(false);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      // Don't set loading to false here - let the data fetch handle it
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (_event === "SIGNED_OUT") {
          setPages([]);
          setBlocks([]);
          setRoadmapTasks([]);
          setCalendarEvents([]);
          setProfile(null);
          setWorkspace(null);
          setIsLoading(false);
          dataLoadedRef.current = false;
        }
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      if (!isLoading) setIsLoading(false);
      dataLoadedRef.current = false;
      return;
    }

    // If data is already loaded, don't refetch
    if (dataLoadedRef.current) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      const [profileRes, pagesRes, blocksRes, roadmapRes, calendarRes] =
        await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).single(),
          supabase.from("pages").select("*").order("created_at"),
          supabase.from("blocks").select("*"),
          supabase.from("roadmap_tasks").select("*"),
          supabase.from("calendar_events").select("*"),
        ]);

      if (profileRes.data) {
        setProfile(profileRes.data);
        setWorkspace({
          id: profileRes.data.id,
          name: profileRes.data.username || "My Workspace",
        });
      }
      if (pagesRes.data) {
        const userPages = pagesRes.data.map(pageFromRow);
        setPages(userPages);
        if (!selectedPageId && userPages.length > 0) {
          setSelectedPageId(userPages[0].id);
        }
      }
      if (blocksRes.data) setBlocks(blocksRes.data.map(blockFromRow));
      // TODO: Map roadmap and calendar data similarly if needed
      if (roadmapRes.data) setRoadmapTasks(roadmapRes.data as RoadmapTask[]);
      if (calendarRes.data)
        setCalendarEvents(calendarRes.data as CalendarEvent[]);

      setIsLoading(false);
      dataLoadedRef.current = true;
    };
    fetchData();

    const pageChannel = supabase
      .channel("public:pages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pages" },
        payload => {
          if (payload.eventType === "INSERT")
            setPages(p => [...p, pageFromRow(payload.new)]);
          if (payload.eventType === "UPDATE")
            setPages(p =>
              p.map(page =>
                page.id === payload.new.id ? pageFromRow(payload.new) : page
              )
            );
          if (payload.eventType === "DELETE") {
            const deletedId = payload.old.id;
            setPages(p => p.filter(page => page.id !== deletedId));
            setBlocks(b => b.filter(block => block.pageId !== deletedId));
            if (selectedPageId === deletedId)
              setSelectedPageId(pages[0]?.id || null);
          }
        }
      )
      .subscribe();

    const blockChannel = supabase
      .channel("public:blocks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "blocks" },
        payload => {
          if (payload.eventType === "INSERT")
            setBlocks(b => [...b, blockFromRow(payload.new)]);
          if (payload.eventType === "UPDATE")
            setBlocks(b =>
              b.map(block =>
                block.id === payload.new.id ? blockFromRow(payload.new) : block
              )
            );
          if (payload.eventType === "DELETE")
            setBlocks(b => b.filter(block => block.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(pageChannel);
      supabase.removeChannel(blockChannel);
    };
  }, [user]);

  const addPage = async (parentId: string | null = null) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("pages")
      .insert({
        title: "Untitled",
        user_id: user.id,
        parent_id: parentId,
        icon: "📄",
      })
      .select()
      .single();
    if (error) console.error("Error adding page:", error);
    else if (data) selectPage(data.id);
  };

  const deletePage = async (pageId: string) => {
    const { error } = await supabase.from("pages").delete().eq("id", pageId);
    if (error) console.error("Error deleting page:", error);
  };

  const updatePage = async (
    pageId: string,
    updates: Partial<Omit<Page, "id" | "userId" | "createdAt">>
  ) => {
    const dbUpdates = {
      title: updates.title,
      icon: updates.icon,
      parent_id: updates.parentId,
      is_expanded: updates.isExpanded,
    };
    const { error } = await supabase
      .from("pages")
      .update(dbUpdates)
      .eq("id", pageId);
    if (error) console.error("Error updating page:", error);
  };

  const togglePageExpansion = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (page) updatePage(pageId, { isExpanded: !page.isExpanded });
  };

  const selectPage = (pageId: string | null) => {
    setSelectedPageId(pageId);
    setSelectedTemplateId(null);
  };

  const selectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setSelectedPageId(null);
  };

  const toggleSidebar = useCallback(
    () => setIsSidebarCollapsed(prev => !prev),
    []
  );

  const getPageBlocks = useCallback(
    (pageId: string) =>
      blocks
        .filter(b => b.pageId === pageId && !b.parentBlockId)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ),
    [blocks]
  );

  const getChildBlocks = useCallback(
    (parentBlockId: string) =>
      blocks
        .filter(b => b.parentBlockId === parentBlockId)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ),
    [blocks]
  );

  const addBlock = async (
    pageId: string,
    afterBlockId?: string,
    parentBlockId?: string
  ): Promise<Block> => {
    if (!user) throw new Error("User not authenticated");
    const { data, error } = await supabase
      .from("blocks")
      .insert({
        page_id: pageId,
        user_id: user.id,
        parent_block_id: parentBlockId,
        type: "text",
        content: "",
      })
      .select()
      .single();
    if (error) throw error;
    return blockFromRow(data);
  };

  const updateBlock = useCallback(
    async (blockId: string, updates: Partial<Block>) => {
      const dbUpdates: any = {};
      if (updates.content !== undefined) dbUpdates.content = updates.content;
      if (updates.type !== undefined) dbUpdates.type = updates.type;
      if (updates.checked !== undefined) dbUpdates.checked = updates.checked;
      if (updates.src !== undefined) dbUpdates.src = updates.src;
      if (updates.language !== undefined) dbUpdates.language = updates.language;
      if (updates.isExpanded !== undefined)
        dbUpdates.is_expanded = updates.isExpanded;

      const { error } = await supabase
        .from("blocks")
        .update(dbUpdates)
        .eq("id", blockId);
      if (error) console.error("Error updating block:", error);
    },
    []
  );

  const deleteBlock = async (blockId: string) => {
    const { error } = await supabase.from("blocks").delete().eq("id", blockId);
    if (error) console.error("Error deleting block:", error);
  };

  const toggleBlockExpansion = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (block) updateBlock(blockId, { isExpanded: !block.isExpanded });
  };

  // Placeholder functions for templates
  const addRoadmapTask = async (task: any) =>
    console.log("addRoadmapTask not implemented with Supabase");
  const updateRoadmapTask = async (taskId: string, updates: any) =>
    console.log("updateRoadmapTask not implemented with Supabase");
  const deleteRoadmapTask = async (taskId: string) =>
    console.log("deleteRoadmapTask not implemented with Supabase");
  const addCalendarEvent = async (event: any) =>
    console.log("addCalendarEvent not implemented with Supabase");
  const updateCalendarEvent = async (eventId: string, updates: any) =>
    console.log("updateCalendarEvent not implemented with Supabase");
  const deleteCalendarEvent = async (eventId: string) =>
    console.log("deleteCalendarEvent not implemented with Supabase");

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AppContext.Provider
      value={{
        session,
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
        addRoadmapTask,
        updateRoadmapTask,
        deleteRoadmapTask,
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
