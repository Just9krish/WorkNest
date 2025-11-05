import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Block } from "../types";
import {
  listRows,
  createRow,
  updateRow,
  deleteRow,
  TABLES,
  queryByUserId,
} from "../lib/appwrite";
import { useAuth } from "./auth-context";
import { mapBlockFromDocument } from "../lib/mappers";
import { ID } from "appwrite";

interface BlocksContextValue {
  blocks: Block[];
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
}

const BlocksContext = createContext<BlocksContextValue | undefined>(undefined);

export function BlocksProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    if (!user) {
      setBlocks([]);
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const response = await listRows(TABLES.blocks, [
          queryByUserId(user.$id),
        ]);
        if (cancelled) return;

        const mappedBlocks = response.rows.map(mapBlockFromDocument);
        console.log(
          "[BlocksContext] Loaded blocks:",
          mappedBlocks.length,
          mappedBlocks
        );
        setBlocks(mappedBlocks);
      } catch (err) {
        if (!cancelled) console.error("Unexpected error loading blocks:", err);
      }
    };
    load();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const getPageBlocks = useCallback(
    (pageId: string) => {
      const filtered = blocks
        .filter(b => b.pageId === pageId && !b.parentBlockId)
        .sort(
          (a, b) =>
            new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime()
        );
      console.log(
        "[BlocksContext] getPageBlocks - pageId:",
        pageId,
        "all blocks:",
        blocks.length,
        "filtered:",
        filtered.length
      );
      return filtered;
    },
    [blocks]
  );

  const getChildBlocks = useCallback(
    (parentBlockId: string) =>
      blocks
        .filter(b => b.parentBlockId === parentBlockId)
        .sort(
          (a, b) =>
            new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime()
        ),
    [blocks]
  );

  const addBlock = useCallback(
    async (
      pageId: string,
      _afterBlockId?: string,
      parentBlockId?: string
    ): Promise<Block> => {
      if (!user) throw new Error("User not authenticated");
      console.log(
        "[BlocksContext] Creating block - pageId:",
        pageId,
        "parentBlockId:",
        parentBlockId
      );
      const newBlock = await createRow(
        TABLES.blocks,
        {
          pageId,
          userId: user.$id,
          parentBlockId: parentBlockId || null,
          type: "text",
          content: "",
          isExpanded: false,
        },
        ID.unique()
      );
      console.log("[BlocksContext] Created block:", newBlock);
      const mapped = mapBlockFromDocument(newBlock);
      console.log("[BlocksContext] Mapped block:", mapped);
      // Update local state immediately
      setBlocks(prev => [...prev, mapped]);
      return mapped;
    },
    [user]
  );

  const updateBlock = useCallback(
    async (blockId: string, updates: Partial<Block>) => {
      // Check if block exists in local state before attempting update
      const blockExists = blocks.some(b => b.$id === blockId);
      if (!blockExists) {
        console.log(
          "[BlocksContext] Block not found in local state, skipping update:",
          blockId
        );
        return;
      }

      try {
        await updateRow(TABLES.blocks, blockId, updates);
        // Update local state immediately
        setBlocks(prev =>
          prev.map(block =>
            block.$id === blockId ? { ...block, ...updates } : block
          )
        );
      } catch (error) {
        console.error("Error updating block:", error);
        // Check if block was already deleted (404 or "not be found" error)
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        const errorCode = (error as { code?: number })?.code;
        if (
          errorCode === 404 ||
          errorMessage.includes("not be found") ||
          errorMessage.includes("could not be found")
        ) {
          console.log(
            "[BlocksContext] Block already deleted, removing from local state:",
            blockId
          );
          setBlocks(prev => prev.filter(block => block.$id !== blockId));
        }
      }
    },
    [blocks]
  );

  const deleteBlock = useCallback(async (blockId: string) => {
    // Optimistically remove from local state first for immediate UI update
    setBlocks(prev => prev.filter(block => block.$id !== blockId));
    console.log(
      "[BlocksContext] Block removed from local state (optimistic update):",
      blockId
    );

    try {
      await deleteRow(TABLES.blocks, blockId);
      console.log(
        "[BlocksContext] Block deleted successfully in Appwrite:",
        blockId
      );
    } catch (error) {
      console.error("Error deleting block from Appwrite:", error);
      // If deletion fails, we could restore the block, but usually it's better to keep it removed
      // since the user already saw it disappear. Only restore if it's not a "not found" error.
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorCode = (error as { code?: number })?.code;
      if (
        errorCode !== 404 &&
        !errorMessage.includes("not be found") &&
        !errorMessage.includes("could not be found")
      ) {
        // If it's a real error (not 404), we might want to restore, but for now we'll keep it removed
        console.warn(
          "[BlocksContext] Block deletion failed but keeping it removed from UI"
        );
      }
    }
  }, []);

  const toggleBlockExpansion = useCallback(
    (blockId: string) => {
      const block = blocks.find(b => b.$id === blockId);
      if (block) void updateBlock(blockId, { isExpanded: !block.isExpanded });
    },
    [blocks, updateBlock]
  );

  const value = useMemo(
    () => ({
      blocks,
      getPageBlocks,
      getChildBlocks,
      addBlock,
      updateBlock,
      deleteBlock,
      toggleBlockExpansion,
    }),
    [
      blocks,
      getPageBlocks,
      getChildBlocks,
      addBlock,
      updateBlock,
      deleteBlock,
      toggleBlockExpansion,
    ]
  );

  return (
    <BlocksContext.Provider value={value}>{children}</BlocksContext.Provider>
  );
}

export function useBlocks() {
  const ctx = useContext(BlocksContext);
  if (!ctx) throw new Error("useBlocks must be used within BlocksProvider");
  return ctx;
}
