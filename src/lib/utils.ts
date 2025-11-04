import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Appwrite collection constants
export const COLLECTIONS = {
  pages: "pages",
  blocks: "blocks",
  profiles: "profiles",
  calendarEvents: "calendar_events",
  roadmapTasks: "roadmap_tasks",
} as const;

export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];
