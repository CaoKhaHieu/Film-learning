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
  title TEXT NOT NULL,
  description TEXT,
  poster TEXT,
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
CREATE INDEX idx_movies_is_vip ON public.movies(is_vip);
CREATE INDEX idx_movies_difficulty ON public.movies(difficulty_level);
CREATE INDEX idx_movies_created_at ON public.movies(created_at DESC);

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
INSERT INTO public.movies (title, description, poster, video_url, is_vip, difficulty_level) VALUES
    ('The Shawshank Redemption', 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.', 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', 'https://example.com/video/shawshank.m3u8', FALSE, 'intermediate'),
    ('The Godfather', 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.', 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', 'https://example.com/video/godfather.m3u8', TRUE, 'advanced'),
    ('Forrest Gump', 'The presidencies of Kennedy and Johnson, the Vietnam War, and other historical events unfold from the perspective of an Alabama man.', 'https://image.tmdb.org/t/p/w500/saHP97rTPS5eLmrLQEcANmKrsFl.jpg', 'https://example.com/video/forrest.m3u8', FALSE, 'beginner');
