import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Page } from "../types";
import {
  listRows,
  createRow,
  updateRow,
  deleteRow,
  TABLES,
  queryByUserId,
  queryBySlug,
  queryOrderByCreatedAt,
} from "../lib/appwrite";
import { useAuth } from "./auth-context";
import { mapPageFromDocument } from "../lib/mappers";
import { generateSlug, generateUniqueSlug } from "../lib/slug";
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
  getPageBySlug: (slug: string) => Promise<Page | null>;
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
        const response = await listRows(TABLES.pages, [
          queryByUserId(user.$id),
          queryOrderByCreatedAt,
        ]);
        if (cancelled) return;

        const mapped = response.rows.map(mapPageFromDocument);
        setPages(mapped);
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
        // Generate unique slug
        const baseSlug = generateSlug("Untitled");
        const existingSlugs = pages.map(p => p.slug);
        const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs);

        const newPage = await createRow(
          TABLES.pages,
          {
            title: "Untitled",
            slug: uniqueSlug,
            userId: user.$id,
            parentId: parentId,
            icon: "📄",
            isExpanded: false,
          },
          ID.unique()
        );
        const mappedPage = mapPageFromDocument(newPage);
        setSelectedPageId(mappedPage.$id);
      } catch (error) {
        console.error("Error adding page:", error);
      }
    },
    [user, pages]
  );

  const updatePage = useCallback(
    async (
      pageId: string,
      updates: Partial<
        Omit<Page, "$id" | "userId" | "$createdAt" | "$updatedAt">
      >
    ) => {
      try {
        // If title is being updated, also update the slug
        if (updates.title !== undefined) {
          const baseSlug = generateSlug(updates.title);
          const existingSlugs = pages
            .filter(p => p.$id !== pageId)
            .map(p => p.slug);
          updates.slug = generateUniqueSlug(baseSlug, existingSlugs);
        }

        await updateRow(TABLES.pages, pageId, updates);
      } catch (error) {
        console.error("Error updating page:", error);
      }
    },
    [pages]
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

  const getPageBySlug = useCallback(
    async (slug: string): Promise<Page | null> => {
      if (!user) return null;
      try {
        const response = await listRows(TABLES.pages, [
          queryByUserId(user.$id),
          queryBySlug(slug),
        ]);
        if (response.rows.length > 0) {
          return mapPageFromDocument(response.rows[0]);
        }
        return null;
      } catch (error) {
        console.error("Error getting page by slug:", error);
        return null;
      }
    },
    [user]
  );

  const value = useMemo(
    () => ({
      pages,
      selectedPageId,
      selectPage,
      addPage,
      updatePage,
      deletePage,
      togglePageExpansion,
      getPageBySlug,
    }),
    [
      pages,
      selectedPageId,
      selectPage,
      addPage,
      updatePage,
      deletePage,
      togglePageExpansion,
      getPageBySlug,
    ]
  );

  return (
    <PagesContext.Provider value={value}>{children}</PagesContext.Provider>
  );
}

export function usePages() {
  const ctx = useContext(PagesContext);
  if (!ctx) throw new Error("usePages must be used within PagesProvider");
  return ctx;
}
