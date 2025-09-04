import { Block, Page, CalendarEvent } from "../types";

export function mapPageFromRow(row: Record<string, unknown>): Page {
  return {
    id: row.id as string,
    createdAt: row.created_at as string,
    title: (row.title as string) || "",
    icon: (row.icon as string) || "",
    parentId: (row.parent_id as string) || null,
    isExpanded: Boolean(row.is_expanded),
    userId: row.user_id as string,
  };
}

export function mapBlockFromRow(row: Record<string, unknown>): Block {
  return {
    id: row.id as string,
    createdAt: row.created_at as string,
    pageId: row.page_id as string,
    userId: row.user_id as string,
    type: row.type as Block["type"],
    content: (row.content as string) || "",
    parentBlockId: (row.parent_block_id as string) || null,
    checked: (row.checked as boolean) ?? null,
    src: (row.src as string) || undefined,
    language: (row.language as string) || undefined,
    isExpanded: Boolean(row.is_expanded),
  };
}

export function mapCalendarEventFromRow(row: Record<string, unknown>): CalendarEvent {
  return {
    id: row.id as string,
    createdAt: row.created_at as string,
    userId: row.user_id as string,
    title: (row.title as string) || "",
    date: (row.date as string) || "",
    time: (row.time as string) || undefined,
    tag: (row.tag as string) || undefined,
    color: (row.color as string) || undefined,
    description: (row.description as string) || null, // Will be null until migration is applied
  };
}


