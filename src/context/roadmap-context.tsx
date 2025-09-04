import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { RoadmapTask } from "../types";
import { supabase } from "../lib/supabase";
import { useAuth } from "./auth-context";

interface RoadmapContextValue {
  roadmapTasks: RoadmapTask[];
}

const RoadmapContext = createContext<RoadmapContextValue | undefined>(undefined);

export function RoadmapProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [roadmapTasks, setRoadmapTasks] = useState<RoadmapTask[]>([]);

  useEffect(() => {
    if (!user) {
      setRoadmapTasks([]);
      return;
    }
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase.from("roadmap_tasks").select("*");
      if (cancelled) return;
      setRoadmapTasks((data || []) as RoadmapTask[]);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const value = useMemo(() => ({ roadmapTasks }), [roadmapTasks]);
  return <RoadmapContext.Provider value={value}>{children}</RoadmapContext.Provider>;
}

export function useRoadmap() {
  const ctx = useContext(RoadmapContext);
  if (!ctx) throw new Error("useRoadmap must be used within RoadmapProvider");
  return ctx;
}


