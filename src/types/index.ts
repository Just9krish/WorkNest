import React from "react";

// Appwrite document base type
export interface AppwriteDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
}

export type Page = AppwriteDocument & {
  icon: string;
  title: string;
  slug: string;
  parentId: string | null;
  isExpanded: boolean;
  userId: string;
};

export type Profile = AppwriteDocument & {
  username: string | null;
  avatarUrl: string | null;
};

export interface Workspace {
  id: string;
  name: string;
}

export type Block = AppwriteDocument & {
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
  icon: React.ReactNode;
  description: string;
}

export interface Template {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  type: "roadmap" | "calendar";
}

export type RoadmapTask = AppwriteDocument & {
  userId: string;
  title: string;
  description: string | null;
  category: "Planning" | "Design" | "Development";
  startDate: string | null;
  endDate: string | null;
  progress: number;
  status: "Not Started" | "In Progress" | "Completed";
};

export type CalendarEvent = AppwriteDocument & {
  userId: string;
  title: string;
  date: string;
  time: string | null;
  tag: string;
  color: string;
  description: string | null;
};
