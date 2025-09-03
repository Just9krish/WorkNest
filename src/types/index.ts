import { Database } from "./supabase";

export type Page = {
  id: string;
  createdAt: string;
  title: string;
  icon: string | null;
  parentId: string | null;
  isExpanded: boolean;
  userId: string;
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface Workspace {
  id: string;
  name: string;
}

export type Block = {
  id: string;
  createdAt: string;
  pageId: string;
  userId: string;
  type: "text" | "heading" | "todo" | "image" | "toggle" | "divider" | "code";
  content: string;
  parentBlockId: string | null;
  checked?: boolean;
  src?: string;
  language?: string;
  isExpanded?: boolean;
};

export interface BlockType {
  type: "text" | "heading" | "todo" | "image" | "toggle" | "divider" | "code";
  label: string;
  icon: string;
  description: string;
}

export interface Template {
  id: string;
  name: string;
  icon: string;
  description: string;
  type: "roadmap" | "calendar";
}

export type RoadmapTask = {
  id: string;
  createdAt: string;
  userId: string;
  title: string;
  description: string | null;
  category: "Planning" | "Design" | "Development";
  startDate: string | null;
  endDate: string | null;
  progress: number;
  status: "Not Started" | "In Progress" | "Completed";
};

export type CalendarEvent = {
  id: string;
  createdAt: string;
  userId: string;
  title: string;
  date: string;
  time: string | null;
  tag: string;
  color: string;
  description: string | null;
};
