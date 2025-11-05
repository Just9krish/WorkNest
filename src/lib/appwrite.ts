import { Client, Account, TablesDB, ID, Query } from "appwrite";

const appwriteUrl = import.meta.env.VITE_APPWRITE_ENDPOINT;
const appwriteProjectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

if (!appwriteUrl || !appwriteProjectId) {
  throw new Error("Appwrite URL and Project ID must be defined in .env file");
}

// Initialize Appwrite client
export const client = new Client()
  .setEndpoint(appwriteUrl)
  .setProject(appwriteProjectId);

// Initialize services
export const account = new Account(client);
export const tablesDB = new TablesDB(client);

// Database and Table IDs (TablesDB API uses "tables" instead of "collections")
export const DATABASE_ID = "6900f122003c5eb510b4";
export const TABLES = {
  pages: "pages",
  blocks: "blocks",
  profiles: "profiles",
  calendarEvents: "calendar_events",
  roadmapTasks: "roadmap_tasks",
} as const;

// Helper functions for common operations using TablesDB API
export const createRow = async (
  tableId: string,
  data: Record<string, unknown>,
  rowId?: string
) => {
  return await tablesDB.createRow({
    databaseId: DATABASE_ID,
    tableId: tableId,
    rowId: rowId || ID.unique(),
    data: data,
  });
};

export const getRow = async (tableId: string, rowId: string) => {
  return await tablesDB.getRow({
    databaseId: DATABASE_ID,
    tableId: tableId,
    rowId: rowId,
  });
};

export const updateRow = async (
  tableId: string,
  rowId: string,
  data: Record<string, unknown>
) => {
  return await tablesDB.updateRow({
    databaseId: DATABASE_ID,
    tableId: tableId,
    rowId: rowId,
    data: data,
  });
};

export const deleteRow = async (tableId: string, rowId: string) => {
  return await tablesDB.deleteRow({
    databaseId: DATABASE_ID,
    tableId: tableId,
    rowId: rowId,
  });
};

export const listRows = async (tableId: string, queries?: string[]) => {
  return await tablesDB.listRows({
    databaseId: DATABASE_ID,
    tableId: tableId,
    queries: queries,
  });
};

// Query helpers
export const queryByUserId = (userId: string) => Query.equal("userId", userId);
export const queryByPageId = (pageId: string) => Query.equal("pageId", pageId);
export const queryByParentId = (parentId: string) =>
  Query.equal("parentId", parentId);
export const queryByDate = (date: string) => Query.equal("date", date);
export const queryBySlug = (slug: string) => Query.equal("slug", slug);
export const queryOrderByCreatedAt = Query.orderDesc("$createdAt");
export const queryOrderByTitle = Query.orderAsc("title");
