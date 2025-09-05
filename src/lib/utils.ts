import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Centralized constants to avoid magic strings in Supabase usage
export const TABLES = {
  pages: "pages",
  blocks: "blocks",
  profiles: "profiles",
  calendarEvents: "calendar_events",
  roadmapTasks: "roadmap_tasks",
} as const;

export const CHANNELS = {
  pages: `public:${"pages"}`,
  blocks: `public:${"blocks"}`,
  calendarEvents: `public:${"calendar_events"}`,
} as const;

export type TableName = typeof TABLES[keyof typeof TABLES];
