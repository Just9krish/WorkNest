import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Page } from "../types";
import { listRows, createRow, updateRow, deleteRow, TABLES, queryByUserId, queryOrderByCreatedAt } from "../lib/appwrite";
import { useAuth } from "./auth-context";
import { mapPageFromDocument } from "../lib/mappers";
import { ID } from "appwrite";

interface PagesContextValue {
  pages: Page[];
  selectedPageId: string | null;
  selectPage: (pageId: string | null) => void;
  addPage: (parentId?: string | null) => Promise<void>;
  updatePage: (
    pageId: string,
    updates: Partial<Omit<Page, "$id" | "userId" | "$createdAt" | "$updatedAt">>
  ) => Promise<void>;
  deletePage: (pageId: string) => Promise<void>;
  togglePageExpansion: (pageId: string) => void;
}

const PagesContext = createContext<PagesContextValue | undefined>(undefined);

export function PagesProvider({ children }: { children: React.ReactNode; }) {
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
        const response = await listRows(
          TABLES.pages,
          [queryByUserId(user.$id), queryOrderByCreatedAt]
        );
        if (cancelled) return;

        const mapped = response.rows.map(mapPageFromDocument);
        setPages(mapped);
        if (mapped.length > 0) setSelectedPageId(mapped[0].$id);
      } catch (err) {
        if (!cancelled) console.error("Unexpected error loading pages:", err);
      }
    };
    load();

    return () => {
      cancelled = true;
    };
  }, [user, selectedPageId]);

  const selectPage = useCallback((pageId: string | null) => {
    setSelectedPageId(pageId);
  }, []);

  const addPage = useCallback(
    async (parentId: string | null = null) => {
      if (!user) return;
      try {
        const newPage = await createRow(
          TABLES.pages,
          {
            title: "Untitled",
            userId: user.$id,
            parentId: parentId,
            icon: "📄",
            isExpanded: false
          },
          ID.unique()
        );
        setSelectedPageId(newPage.$id);
      } catch (error) {
        console.error("Error adding page:", error);
      }
    },
    [user]
  );

  const updatePage = useCallback(
    async (
      pageId: string,
      updates: Partial<Omit<Page, "$id" | "userId" | "$createdAt" | "$updatedAt">>
    ) => {
      try {
        await updateRow(TABLES.pages, pageId, updates);
      } catch (error) {
        console.error("Error updating page:", error);
      }
    },
    []
  );

  const deletePage = useCallback(async (pageId: string) => {
    try {
      await deleteRow(TABLES.pages, pageId);
    } catch (error) {
      console.error("Error deleting page:", error);
    }
  }, []);

  const togglePageExpansion = useCallback(
    (pageId: string) => {
      const page = pages.find(p => p.$id === pageId);
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


