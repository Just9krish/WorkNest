# WorkNest Database Schema

This document describes all the required tables (collections) for the WorkNest application, including their columns, data types, and relationships.

## Important Note About User Relations

**⚠️ You CANNOT create relations to Appwrite's Auth/Users collection.** Appwrite does not allow direct relations to the built-in authentication collection. Instead, all collections use a **string `userId` field** to store the Appwrite user ID as a reference. This is a manual reference, not a database relation.

## Database Setup

**Database ID:** `worknest`

---

## 1. Profiles Collection

**Collection ID:** `profiles`

### Description

Stores user profile information linked to Appwrite users.

### Attributes (Columns)

| Column Name  | Type     | Size | Required | Default | Description                                         |
| ------------ | -------- | ---- | -------- | ------- | --------------------------------------------------- |
| `$id`        | string   | -    | ✅       | Auto    | Document ID (should match Appwrite user ID)         |
| `userId`     | string   | 255  | ✅       | -       | Appwrite user ID (string reference, NOT a relation) |
| `username`   | string   | 255  | ❌       | null    | User's display name                                 |
| `avatarUrl`  | string   | 500  | ❌       | null    | URL to user's avatar image                          |
| `$createdAt` | datetime | -    | ✅       | Auto    | Creation timestamp                                  |
| `$updatedAt` | datetime | -    | ✅       | Auto    | Last update timestamp                               |

### Indexes

- **userId_index** - Key index on `userId` (for fast lookups)

### Permissions

- **Read:** Users (can read their own profile)
- **Write:** Users (can update their own profile)
- **Create:** Users
- **Update:** Users
- **Delete:** Users

### Relationships

- **No relation** - `userId` is a string field storing the Appwrite user ID. This is a manual reference, not a database relation.

---

## 2. Pages Collection

**Collection ID:** `pages`

### Description

Stores hierarchical pages/pages that users can organize in a tree structure.

### Attributes (Columns)

| Column Name  | Type     | Size | Required | Default    | Description                                         |
| ------------ | -------- | ---- | -------- | ---------- | --------------------------------------------------- |
| `$id`        | string   | -    | ✅       | Auto       | Document ID                                         |
| `userId`     | string   | 255  | ✅       | -          | Appwrite user ID (string reference, NOT a relation) |
| `title`      | string   | 255  | ✅       | "Untitled" | Page title                                          |
| `slug`       | string   | 255  | ✅       | -          | URL-friendly slug for routing (unique per user)     |
| `icon`       | string   | 50   | ❌       | null       | Emoji or icon identifier                            |
| `parentId`   | string   | 255  | ❌       | null       | ID of parent page (for hierarchy, string reference) |
| `isExpanded` | boolean  | -    | ✅       | false      | Whether the page is expanded in UI                  |
| `$createdAt` | datetime | -    | ✅       | Auto       | Creation timestamp                                  |
| `$updatedAt` | datetime | -    | ✅       | Auto       | Last update timestamp                               |

### Indexes

- **userId_index** - Key index on `userId` (for filtering by user)
- **slug_index** - Key index on `slug` (for querying by slug, should be unique per user)
- **parentId_index** - Key index on `parentId` (optional, for hierarchy queries)

### Permissions

- **Read:** Users (can read their own pages)
- **Write:** Users (can update their own pages)
- **Create:** Users
- **Update:** Users
- **Delete:** Users

### Relationships

- **No relation to Auth** - `userId` is a string field, not a relation
- **Self-Referential** (via `parentId` - pages can have parent pages) - This is a string reference, NOT a relation attribute

### Relation Types

- **parentId** → Self-reference: `One-to-Many` (one page can have many child pages) - Use string reference, do NOT create a relation attribute

---

## 3. Blocks Collection

**Collection ID:** `blocks`

### Description

Stores content blocks (text, headings, todos, images, etc.) that belong to pages. Supports nested/hierarchical blocks.

### Attributes (Columns)

| Column Name     | Type     | Size  | Required | Default | Description                                                                 |
| --------------- | -------- | ----- | -------- | ------- | --------------------------------------------------------------------------- |
| `$id`           | string   | -     | ✅       | Auto    | Document ID                                                                 |
| `userId`        | string   | 255   | ✅       | -       | Appwrite user ID (string reference, NOT a relation)                         |
| `pageId`        | string   | 255   | ✅       | -       | ID of the page this block belongs to (string reference, NOT a relation)     |
| `type`          | string   | 50    | ✅       | "text"  | Block type: "text", "heading", "todo", "image", "toggle", "divider", "code" |
| `content`       | string   | 10000 | ✅       | ""      | Main content of the block                                                   |
| `parentBlockId` | string   | 255   | ❌       | null    | ID of parent block (for nested blocks, string reference)                    |
| `checked`       | boolean  | -     | ❌       | null    | For todo blocks - whether it's checked                                      |
| `src`           | string   | 500   | ❌       | null    | For image blocks - image URL                                                |
| `language`      | string   | 50    | ❌       | null    | For code blocks - programming language                                      |
| `isExpanded`    | boolean  | -     | ✅       | false   | For toggle blocks - whether expanded                                        |
| `$createdAt`    | datetime | -     | ✅       | Auto    | Creation timestamp                                                          |
| `$updatedAt`    | datetime | -     | ✅       | Auto    | Last update timestamp                                                       |

### Indexes

- **userId_index** - Key index on `userId` (for filtering by user)
- **pageId_index** - Key index on `pageId` (for filtering blocks by page)
- **parentBlockId_index** - Key index on `parentBlockId` (optional, for hierarchy queries)

### Permissions

- **Read:** Users (can read their own blocks)
- **Write:** Users (can update their own blocks)
- **Create:** Users
- **Update:** Users
- **Delete:** Users

### Relationships

- **No relations** - All references use string fields, NOT relation attributes
- **pageId** → Pages: String reference (many blocks belong to one page)
- **parentBlockId** → Self-reference: String reference (one block can have many child blocks)

### Relation Types

- **pageId** → Pages: Use string reference, do NOT create a relation attribute
- **parentBlockId** → Self-reference: Use string reference, do NOT create a relation attribute

---

## 4. Calendar Events Collection

**Collection ID:** `calendar_events`

### Description

Stores calendar events with dates, times, tags, and colors.

### Attributes (Columns)

| Column Name   | Type     | Size | Required | Default | Description                                         |
| ------------- | -------- | ---- | -------- | ------- | --------------------------------------------------- |
| `$id`         | string   | -    | ✅       | Auto    | Document ID                                         |
| `userId`      | string   | 255  | ✅       | -       | Appwrite user ID (string reference, NOT a relation) |
| `title`       | string   | 255  | ✅       | -       | Event title                                         |
| `date`        | string   | 50   | ✅       | -       | Event date (ISO format: YYYY-MM-DD)                 |
| `time`        | string   | 20   | ❌       | null    | Event time (HH:MM format)                           |
| `tag`         | string   | 100  | ✅       | -       | Event tag/category                                  |
| `color`       | string   | 50   | ✅       | -       | Color code/identifier for the event                 |
| `description` | string   | 5000 | ❌       | null    | Event description/notes                             |
| `$createdAt`  | datetime | -    | ✅       | Auto    | Creation timestamp                                  |
| `$updatedAt`  | datetime | -    | ✅       | Auto    | Last update timestamp                               |

### Indexes

- **userId_index** - Key index on `userId` (for filtering by user)
- **date_index** - Key index on `date` (for filtering by date)

### Permissions

- **Read:** Users (can read their own events)
- **Write:** Users (can update their own events)
- **Create:** Users
- **Update:** Users
- **Delete:** Users

### Relationships

- **No relation** - `userId` is a string field storing the Appwrite user ID, not a relation attribute

---

## 5. Roadmap Tasks Collection

**Collection ID:** `roadmap_tasks`

### Description

Stores roadmap tasks with categories, dates, progress, and status.

### Attributes (Columns)

| Column Name   | Type     | Size | Required | Default       | Description                                            |
| ------------- | -------- | ---- | -------- | ------------- | ------------------------------------------------------ |
| `$id`         | string   | -    | ✅       | Auto          | Document ID                                            |
| `userId`      | string   | 255  | ✅       | -             | Appwrite user ID (string reference, NOT a relation)    |
| `title`       | string   | 255  | ✅       | -             | Task title                                             |
| `description` | string   | 5000 | ❌       | null          | Task description                                       |
| `category`    | string   | 50   | ✅       | -             | Task category: "Planning", "Design", "Development"     |
| `startDate`   | string   | 50   | ❌       | null          | Start date (ISO format: YYYY-MM-DD)                    |
| `endDate`     | string   | 50   | ❌       | null          | End date (ISO format: YYYY-MM-DD)                      |
| `progress`    | integer  | -    | ✅       | 0             | Progress percentage (0-100)                            |
| `status`      | string   | 50   | ✅       | "Not Started" | Task status: "Not Started", "In Progress", "Completed" |
| `$createdAt`  | datetime | -    | ✅       | Auto          | Creation timestamp                                     |
| `$updatedAt`  | datetime | -    | ✅       | Auto          | Last update timestamp                                  |

### Indexes

- **userId_index** - Key index on `userId` (for filtering by user)
- **category_index** - Key index on `category` (optional, for filtering by category)
- **status_index** - Key index on `status` (optional, for filtering by status)

### Permissions

- **Read:** Users (can read their own tasks)
- **Write:** Users (can update their own tasks)
- **Create:** Users
- **Update:** Users
- **Delete:** Users

### Relationships

- **No relation** - `userId` is a string field storing the Appwrite user ID, not a relation attribute

---

## Summary of Relationships

**⚠️ IMPORTANT: All relationships use STRING REFERENCES, NOT relation attributes.**

```
Appwrite Users (Auth Collection) ──> userId (string field) ──< All Collections
  ├─ Profiles (via userId string)
  ├─ Pages (via userId string)
  ├─ Blocks (via userId string)
  ├─ Calendar Events (via userId string)
  └─ Roadmap Tasks (via userId string)

Pages (self-referential via parentId string)
  └─< Pages (child pages)

Pages ──> pageId (string field) ──< Blocks
  └─ Many blocks belong to one page

Blocks (self-referential via parentBlockId string)
  └─< Blocks (child blocks)
```

**Note:** In Appwrite Dashboard, when creating these collections:

- Do NOT create relation attributes for `userId`, `pageId`, `parentId`, or `parentBlockId`
- Create them as STRING attributes only
- Use string fields to store document IDs manually

---

## Quick Setup Checklist

When creating these collections in Appwrite Dashboard:

1. ✅ Create all 5 collections with their Collection IDs
2. ✅ Add all attributes with correct types and sizes
3. ✅ Set required fields appropriately
4. ✅ Create indexes as specified
5. ✅ Set permissions (Users can read/write/create/update/delete their own documents)
6. ✅ Ensure `userId` field exists in all collections (except profiles where `$id` = userId)
7. ⚠️ **DO NOT create relation attributes** - Use string attributes for all references (`userId`, `pageId`, `parentId`, `parentBlockId`)

## Notes

- **All collections use `userId` as a STRING field** to filter documents by user (except `profiles` where the document ID itself is the user ID)
- **You CANNOT create relations to Appwrite's Auth collection** - use string references only
- **Do NOT create relation attributes** in Appwrite Dashboard - use string attributes for all ID references
- The `$id`, `$createdAt`, and `$updatedAt` fields are automatically managed by Appwrite
- String sizes should be set appropriately based on expected content length
- Boolean fields default to `false` unless specified
- Nullable fields should have `required: false` and allow null values
- Relations are handled manually in code by querying with the string IDs
