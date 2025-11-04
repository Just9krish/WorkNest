import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Block } from "../types";
import { databases, DATABASE_ID, COLLECTIONS, queryByUserId } from "../lib/appwrite";
import { useAuth } from "./auth-context";
import { mapBlockFromDocument } from "../lib/mappers";
import { ID } from "appwrite";

interface BlocksContextValue {
  blocks: Block[];
  getPageBlocks: (pageId: string) => Block[];
  getChildBlocks: (parentBlockId: string) => Block[];
  addBlock: (pageId: string, afterBlockId?: string, parentBlockId?: string) => Promise<Block>;
  updateBlock: (blockId: string, updates: Partial<Block>) => Promise<void>;
  deleteBlock: (blockId: string) => Promise<void>;
  toggleBlockExpansion: (blockId: string) => void;
}

const BlocksContext = createContext<BlocksContextValue | undefined>(undefined);

export function BlocksProvider({ children }: { children: React.ReactNode; }) {
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
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.blocks,
          [queryByUserId(user.$id)]
        );
        if (cancelled) return;

        setBlocks(response.documents.map(mapBlockFromDocument));
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
    (pageId: string) =>
      blocks
        .filter(b => b.pageId === pageId && !b.parentBlockId)
        .sort((a, b) => new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime()),
    [blocks]
  );

  const getChildBlocks = useCallback(
    (parentBlockId: string) =>
      blocks
        .filter(b => b.parentBlockId === parentBlockId)
        .sort((a, b) => new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime()),
    [blocks]
  );

  const addBlock = useCallback(
    async (pageId: string, _afterBlockId?: string, parentBlockId?: string): Promise<Block> => {
      if (!user) throw new Error("User not authenticated");
      try {
        const newBlock = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.blocks,
          ID.unique(),
          {
            pageId,
            userId: user.$id,
            parentBlockId: parentBlockId || null,
            type: "text",
            content: ""
          }
        );
        return mapBlockFromDocument(newBlock);
      } catch (error) {
        throw error;
      }
    },
    [user]
  );

  const updateBlock = useCallback(async (blockId: string, updates: Partial<Block>) => {
    try {
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.blocks, blockId, updates);
    } catch (error) {
      console.error("Error updating block:", error);
    }
  }, []);

  const deleteBlock = useCallback(async (blockId: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.blocks, blockId);
    } catch (error) {
      console.error("Error deleting block:", error);
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
    () => ({ blocks, getPageBlocks, getChildBlocks, addBlock, updateBlock, deleteBlock, toggleBlockExpansion }),
    [blocks, getPageBlocks, getChildBlocks, addBlock, updateBlock, deleteBlock, toggleBlockExpansion]
  );

  return <BlocksContext.Provider value={value}>{children}</BlocksContext.Provider>;
}

export function useBlocks() {
  const ctx = useContext(BlocksContext);
  if (!ctx) throw new Error("useBlocks must be used within BlocksProvider");
  return ctx;
}


