-- =============================================
-- DROP OLD DATABASE SCHEMA
-- Run this BEFORE applying the new schema
-- WARNING: This will delete ALL data!
-- =============================================

-- Drop all views first
DROP VIEW IF EXISTS episodes_full CASCADE;
DROP VIEW IF EXISTS movies_with_genres CASCADE;

-- Drop all triggers
DROP TRIGGER IF EXISTS update_episodes_updated_at ON episodes;
DROP TRIGGER IF EXISTS update_movies_updated_at ON movies;

-- Drop all functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop all tables (in reverse dependency order)
DROP TABLE IF EXISTS public.subtitles CASCADE;
DROP TABLE IF EXISTS public.video_sources CASCADE;
DROP TABLE IF EXISTS public.episodes CASCADE;
DROP TABLE IF EXISTS public.seasons CASCADE;
DROP TABLE IF EXISTS public.movie_genres CASCADE;
DROP TABLE IF EXISTS public.genres CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.movies CASCADE;

-- Clean up any remaining policies (optional, but safe)
-- Note: Policies are automatically dropped when tables are dropped

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Old schema dropped successfully! You can now run the new schema.';
END $$;
