import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { RoadmapTask } from "../types";
import { listRows, TABLES, queryByUserId } from "../lib/appwrite";
import { useAuth } from "./auth-context";
import { mapRoadmapTaskFromDocument } from "../lib/mappers";

interface RoadmapContextValue {
  roadmapTasks: RoadmapTask[];
}

const RoadmapContext = createContext<RoadmapContextValue | undefined>(undefined);

export function RoadmapProvider({ children }: { children: React.ReactNode; }) {
  const { user } = useAuth();
  const [roadmapTasks, setRoadmapTasks] = useState<RoadmapTask[]>([]);

  useEffect(() => {
    if (!user) {
      setRoadmapTasks([]);
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const response = await listRows(
          TABLES.roadmapTasks,
          [queryByUserId(user.$id)]
        );
        if (cancelled) return;

        setRoadmapTasks(response.rows.map(mapRoadmapTaskFromDocument));
      } catch (err) {
        if (!cancelled) console.error("Unexpected error loading roadmap tasks:", err);
      }
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


