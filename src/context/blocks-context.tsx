import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Block } from "../types";
import { supabase } from "../lib/supabase";
import { useAuth } from "./auth-context";
import { mapBlockFromRow } from "../lib/mappers";

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
      const { data } = await supabase.from("blocks").select("*");
      if (cancelled) return;
      setBlocks((data || []).map(mapBlockFromRow));
    };
    load();

    const channel = supabase
      .channel("public:blocks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "blocks" },
        payload => {
          if (payload.eventType === "INSERT") setBlocks(b => [...b, mapBlockFromRow(payload.new)]);
          if (payload.eventType === "UPDATE")
            setBlocks(b => b.map(bl => (bl.id === payload.new.id ? mapBlockFromRow(payload.new) : bl)));
          if (payload.eventType === "DELETE") setBlocks(b => b.filter(bl => bl.id !== (payload.old.id as string)));
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getPageBlocks = useCallback(
    (pageId: string) =>
      blocks
        .filter(b => b.pageId === pageId && !b.parentBlockId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [blocks]
  );

  const getChildBlocks = useCallback(
    (parentBlockId: string) =>
      blocks
        .filter(b => b.parentBlockId === parentBlockId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [blocks]
  );

  const addBlock = useCallback(
    async (pageId: string, _afterBlockId?: string, parentBlockId?: string): Promise<Block> => {
      if (!user) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from("blocks")
        .insert({ page_id: pageId, user_id: user.id, parent_block_id: parentBlockId, type: "text", content: "" })
        .select()
        .single();
      if (error) throw error;
      return mapBlockFromRow(data as Record<string, unknown>);
    },
    [user]
  );

  const updateBlock = useCallback(async (blockId: string, updates: Partial<Block>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.checked !== undefined) dbUpdates.checked = updates.checked;
    if (updates.src !== undefined) dbUpdates.src = updates.src;
    if (updates.language !== undefined) dbUpdates.language = updates.language;
    if (updates.isExpanded !== undefined) dbUpdates.is_expanded = updates.isExpanded;
    const { error } = await supabase.from("blocks").update(dbUpdates).eq("id", blockId);
    if (error) console.error("Error updating block:", error);
  }, []);

  const deleteBlock = useCallback(async (blockId: string) => {
    const { error } = await supabase.from("blocks").delete().eq("id", blockId);
    if (error) console.error("Error deleting block:", error);
  }, []);

  const toggleBlockExpansion = useCallback(
    (blockId: string) => {
      const block = blocks.find(b => b.id === blockId);
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


