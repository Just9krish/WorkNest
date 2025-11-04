import { Block, Page, CalendarEvent, RoadmapTask, Profile } from "../types";

export function mapPageFromDocument(doc: any): Page {
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
    title: doc.title || "",
    icon: doc.icon || null,
    parentId: doc.parentId || null,
    isExpanded: Boolean(doc.isExpanded),
    userId: doc.userId,
  };
}

export function mapBlockFromDocument(doc: any): Block {
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
    pageId: doc.pageId,
    userId: doc.userId,
    type: doc.type,
    content: doc.content || "",
    parentBlockId: doc.parentBlockId || null,
    checked: doc.checked ?? null,
    src: doc.src || undefined,
    language: doc.language || undefined,
    isExpanded: Boolean(doc.isExpanded),
  };
}

export function mapCalendarEventFromDocument(doc: any): CalendarEvent {
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
    userId: doc.userId,
    title: doc.title || "",
    date: doc.date || "",
    time: doc.time || null,
    tag: doc.tag || "",
    color: doc.color || "",
    description: doc.description || null,
  };
}

export function mapRoadmapTaskFromDocument(doc: any): RoadmapTask {
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
    userId: doc.userId,
    title: doc.title || "",
    description: doc.description || null,
    category: doc.category,
    startDate: doc.startDate || null,
    endDate: doc.endDate || null,
    progress: doc.progress || 0,
    status: doc.status,
  };
}

export function mapProfileFromDocument(doc: any): Profile {
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
    username: doc.username || null,
    avatarUrl: doc.avatarUrl || null,
  };
}


