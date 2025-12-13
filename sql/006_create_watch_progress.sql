-- Create watch_progress table
-- Renamed current_time to watched_time to avoid SQL keyword conflict
CREATE TABLE public.watch_progress (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
  watched_time INTEGER DEFAULT 0, -- Renamed from current_time
  duration INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, movie_id)
);

-- Enable RLS
ALTER TABLE public.watch_progress ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own progress" ON public.watch_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.watch_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.watch_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Index for faster sorting
CREATE INDEX idx_watch_progress_updated_at ON public.watch_progress(updated_at DESC);
