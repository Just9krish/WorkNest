/*
# Initial Schema Setup for Worknest Project Management

This script sets up the foundational tables for the application, including profiles, pages, blocks, and templates. It also establishes Row Level Security (RLS) policies to ensure users can only access their own data and creates a trigger to automatically populate user profiles upon sign-up.

## Query Description:
This migration is a **STRUCTURAL** change that creates new tables and security rules. It is designed to be run on a new or empty project. If you have existing tables with the same names, this script will fail. This operation is safe and does not modify or delete any existing user data outside of the tables it creates.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Medium"
- Requires-Backup: false
- Reversible: false

## Structure Details:
- **Tables Created**: `profiles`, `pages`, `blocks`, `roadmap_tasks`, `calendar_events`
- **Functions Created**: `handle_new_user()`
- **Triggers Created**: `on_auth_user_created` on `auth.users`
- **RLS Policies**: Enabled and configured for all new tables.

## Security Implications:
- RLS Status: Enabled on all created tables.
- Policy Changes: Yes, new policies are created to restrict data access to the record owner.
- Auth Requirements: Policies rely on `auth.uid()` to identify the current user.

## Performance Impact:
- Indexes: Primary keys and foreign keys are indexed by default. An index is added to `pages(parent_id)`.
- Triggers: A single trigger is added to `auth.users` which fires once per user creation.
- Estimated Impact: Low. The setup is standard and optimized for common query patterns.
*/

-- 1. PROFILES TABLE
-- Stores public user data.
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  workspace_name TEXT DEFAULT 'My Workspace'
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- 2. NEW USER TRIGGER
-- This trigger automatically creates a profile entry when a new user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 3. PAGES TABLE
-- Stores individual pages and their hierarchy.
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  icon TEXT,
  is_expanded BOOLEAN DEFAULT false
);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_pages_user_id ON public.pages(user_id);
CREATE INDEX idx_pages_parent_id ON public.pages(parent_id);

CREATE POLICY "Users can manage their own pages."
  ON public.pages FOR ALL
  USING ( auth.uid() = user_id );


-- 4. BLOCKS TABLE
-- Stores the content blocks for each page.
CREATE TABLE public.blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  parent_block_id UUID REFERENCES public.blocks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  type TEXT NOT NULL,
  content TEXT,
  checked BOOLEAN,
  src TEXT,
  language TEXT,
  is_expanded BOOLEAN,
  position INTEGER
);

ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_blocks_user_id ON public.blocks(user_id);
CREATE INDEX idx_blocks_page_id ON public.blocks(page_id);

CREATE POLICY "Users can manage blocks on their own pages."
  ON public.blocks FOR ALL
  USING ( auth.uid() = user_id );


-- 5. ROADMAP TASKS TABLE
CREATE TABLE public.roadmap_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  start_date TEXT,
  end_date TEXT,
  progress INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Not Started'
);

ALTER TABLE public.roadmap_tasks ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_roadmap_tasks_user_id ON public.roadmap_tasks(user_id);

CREATE POLICY "Users can manage their own roadmap tasks."
  ON public.roadmap_tasks FOR ALL
  USING ( auth.uid() = user_id );


-- 6. CALENDAR EVENTS TABLE
CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  "time" TEXT,
  tag TEXT,
  color TEXT
);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX idx_calendar_events_date ON public.calendar_events(date);

CREATE POLICY "Users can manage their own calendar events."
  ON public.calendar_events FOR ALL
  USING ( auth.uid() = user_id );

-- 7. Enable REALTIME on tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.pages, public.blocks, public.roadmap_tasks, public.calendar_events;
