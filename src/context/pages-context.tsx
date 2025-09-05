import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Page } from "../types";
import { supabase } from "../lib/supabase";
import { TABLES, CHANNELS } from "../lib/utils";
import { useAuth } from "./auth-context";
import { mapPageFromRow } from "../lib/mappers";

interface PagesContextValue {
  pages: Page[];
  selectedPageId: string | null;
  selectPage: (pageId: string | null) => void;
  addPage: (parentId?: string | null) => Promise<void>;
  updatePage: (
    pageId: string,
    updates: Partial<Omit<Page, "id" | "userId" | "createdAt">>
  ) => Promise<void>;
  deletePage: (pageId: string) => Promise<void>;
  togglePageExpansion: (pageId: string) => void;
}

const PagesContext = createContext<PagesContextValue | undefined>(undefined);

export function PagesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setPages([]);
      setSelectedPageId(null);
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const { data, error } = await supabase.from(TABLES.pages).select("*").order("created_at");
        if (cancelled) return;
        if (error) {
          console.error("Error loading pages:", error);
          return;
        }
        const mapped = (data || []).map(mapPageFromRow);
        setPages(mapped);
        if (mapped.length > 0) setSelectedPageId(mapped[0].id);
      } catch (err) {
        if (!cancelled) console.error("Unexpected error loading pages:", err);
      }
    };
    load();

    const channel = supabase
      .channel(CHANNELS.pages)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: TABLES.pages },
        payload => {
          if (payload.eventType === "INSERT") setPages(p => [...p, mapPageFromRow(payload.new)]);
          if (payload.eventType === "UPDATE")
            setPages(p => p.map(pg => (pg.id === payload.new.id ? mapPageFromRow(payload.new) : pg)));
          if (payload.eventType === "DELETE") {
            const deletedId = payload.old.id as string;
            setPages(p => p.filter(pg => pg.id !== deletedId));
            if (selectedPageId === deletedId) setSelectedPageId(null);
          }
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user, selectedPageId]);

  const selectPage = useCallback((pageId: string | null) => {
    setSelectedPageId(pageId);
  }, []);

  const addPage = useCallback(
    async (parentId: string | null = null) => {
      if (!user) return;
      const { data, error } = await supabase
        .from(TABLES.pages)
        .insert({ title: "Untitled", user_id: user.id, parent_id: parentId, icon: "📄" })
        .select()
        .single();
      if (error) console.error("Error adding page:", error);
      else if (data) setSelectedPageId(data.id as string);
    },
    [user]
  );

  const updatePage = useCallback(
    async (
      pageId: string,
      updates: Partial<Omit<Page, "id" | "userId" | "createdAt">>
    ) => {
      const dbUpdates = {
        title: updates.title,
        icon: updates.icon,
        parent_id: updates.parentId,
        is_expanded: updates.isExpanded,
      };
      const { error } = await supabase.from(TABLES.pages).update(dbUpdates).eq("id", pageId);
      if (error) console.error("Error updating page:", error);
    },
    []
  );

  const deletePage = useCallback(async (pageId: string) => {
    const { error } = await supabase.from(TABLES.pages).delete().eq("id", pageId);
    if (error) console.error("Error deleting page:", error);
  }, []);

  const togglePageExpansion = useCallback(
    (pageId: string) => {
      const page = pages.find(p => p.id === pageId);
      if (page) void updatePage(pageId, { isExpanded: !page.isExpanded });
    },
    [pages, updatePage]
  );

  const value = useMemo(
    () => ({ pages, selectedPageId, selectPage, addPage, updatePage, deletePage, togglePageExpansion }),
    [pages, selectedPageId, selectPage, addPage, updatePage, deletePage, togglePageExpansion]
  );

  return <PagesContext.Provider value={value}>{children}</PagesContext.Provider>;
}

export function usePages() {
  const ctx = useContext(PagesContext);
  if (!ctx) throw new Error("usePages must be used within PagesProvider");
  return ctx;
}


