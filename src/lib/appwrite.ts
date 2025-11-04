import { Client, Account, Databases, ID, Query } from "appwrite";

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
export const databases = new Databases(client);

// Database and Collection IDs
export const DATABASE_ID = "6900f122003c5eb510b4";
export const COLLECTIONS = {
    pages: "pages",
    blocks: "blocks",
    profiles: "profiles",
    calendarEvents: "calendar_events",
    roadmapTasks: "roadmap_tasks",
} as const;

// Helper functions for common operations
export const createDocument = async (
    collectionId: string,
    data: Record<string, unknown>,
    documentId?: string
) => {
    return await databases.createDocument(
        DATABASE_ID,
        collectionId,
        documentId || ID.unique(),
        data
    );
};

export const getDocument = async (
    collectionId: string,
    documentId: string
) => {
    return await databases.getDocument(DATABASE_ID, collectionId, documentId);
};

export const updateDocument = async (
    collectionId: string,
    documentId: string,
    data: Record<string, unknown>
) => {
    return await databases.updateDocument(DATABASE_ID, collectionId, documentId, data);
};

export const deleteDocument = async (
    collectionId: string,
    documentId: string
) => {
    return await databases.deleteDocument(DATABASE_ID, collectionId, documentId);
};

export const listDocuments = async (
    collectionId: string,
    queries?: string[]
) => {
    return await databases.listDocuments(DATABASE_ID, collectionId, queries);
};

// Query helpers
export const queryByUserId = (userId: string) => Query.equal("userId", userId);
export const queryByPageId = (pageId: string) => Query.equal("pageId", pageId);
export const queryByParentId = (parentId: string) => Query.equal("parentId", parentId);
export const queryByDate = (date: string) => Query.equal("date", date);
export const queryOrderByCreatedAt = Query.orderDesc("$createdAt");
export const queryOrderByTitle = Query.orderAsc("title");