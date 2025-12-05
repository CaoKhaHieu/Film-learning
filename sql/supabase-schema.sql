-- =============================================
-- FILM LEARNING DATABASE SCHEMA - SIMPLE VERSION
-- Supabase PostgreSQL Database
-- Simplified for basic movie management
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- MOVIES TABLE
-- =============================================

CREATE TABLE public.movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id INTEGER UNIQUE,        -- TMDB Movie ID
  title TEXT NOT NULL,           -- Original English title
  title_vi TEXT,                 -- Vietnamese title
  overview TEXT,                 -- Movie description
  poster TEXT,                   -- Poster image URL
  background_image TEXT,         -- Backdrop image URL
  release_date DATE,
  runtime INTEGER,               -- Duration in minutes
  vote_average DECIMAL(3,1),     -- TMDB rating (0-10)
  genres TEXT,                   -- Comma-separated genres
  video_url TEXT,
  is_vip BOOLEAN DEFAULT FALSE,  -- VIP-only content
  difficulty_level TEXT,         -- beginner, intermediate, advanced
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SUBTITLES TABLE
-- =============================================

CREATE TABLE public.subtitles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
  language TEXT,      -- 'en', 'vi'
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SUBSCRIPTIONS TABLE
-- =============================================

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT,                 -- 'free' | 'vip'
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,      -- null = lifetime
  status TEXT DEFAULT 'active', -- active | canceled | expired
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Movies indexes
CREATE INDEX idx_movies_tmdb_id ON public.movies(tmdb_id);
CREATE INDEX idx_movies_is_vip ON public.movies(is_vip);
CREATE INDEX idx_movies_difficulty ON public.movies(difficulty_level);
CREATE INDEX idx_movies_created_at ON public.movies(created_at DESC);
CREATE INDEX idx_movies_release_date ON public.movies(release_date DESC);
CREATE INDEX idx_movies_vote_average ON public.movies(vote_average DESC);

-- Subtitles indexes
CREATE INDEX idx_subtitles_movie ON public.subtitles(movie_id);
CREATE INDEX idx_subtitles_language ON public.subtitles(language);

-- Subscriptions indexes
CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_plan ON public.subscriptions(plan);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtitles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Movies policies
CREATE POLICY "Public can view all movies" ON public.movies
    FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can insert movies" ON public.movies
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update movies" ON public.movies
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete movies" ON public.movies
    FOR DELETE USING (auth.role() = 'authenticated');

-- Subtitles policies
CREATE POLICY "Public can view all subtitles" ON public.subtitles
    FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can insert subtitles" ON public.subtitles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update subtitles" ON public.subtitles
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete subtitles" ON public.subtitles
    FOR DELETE USING (auth.role() = 'authenticated');

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- SAMPLE DATA (OPTIONAL)
-- =============================================

-- Insert sample movies
INSERT INTO public.movies (tmdb_id, title, title_vi, overview, poster, background_image, release_date, runtime, vote_average, genres, video_url, is_vip, difficulty_level) VALUES
    (278, 'The Shawshank Redemption', 'Nhà Tù Shawshank', 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.', 'https://image.tmdb.org/t/p/original/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', 'https://image.tmdb.org/t/p/original/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg', '1994-09-23', 142, 8.7, 'Drama, Crime', 'https://example.com/video/shawshank.m3u8', FALSE, 'intermediate'),
    (238, 'The Godfather', 'Bố Già', 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.', 'https://image.tmdb.org/t/p/original/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', 'https://image.tmdb.org/t/p/original/tmU7GeKVybMWFButWEGl2M4GeiP.jpg', '1972-03-14', 175, 8.7, 'Drama, Crime', 'https://example.com/video/godfather.m3u8', TRUE, 'advanced'),
    (13, 'Forrest Gump', 'Forrest Gump', 'The presidencies of Kennedy and Johnson, the Vietnam War, and other historical events unfold from the perspective of an Alabama man.', 'https://image.tmdb.org/t/p/original/saHP97rTPS5eLmrLQEcANmKrsFl.jpg', 'https://image.tmdb.org/t/p/original/qdIMHd4sEfJSckfVJfKQvisL02a.jpg', '1994-06-23', 142, 8.5, 'Comedy, Drama, Romance', 'https://example.com/video/forrest.m3u8', FALSE, 'beginner');
