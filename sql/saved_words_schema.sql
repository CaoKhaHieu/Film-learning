-- =============================================
-- SAVED WORDS TABLE (VOCABULARY)
-- =============================================

CREATE TABLE public.saved_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  translation TEXT,
  context_sentence TEXT,
  movie_id UUID REFERENCES public.movies(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, word)
);

-- =============================================
-- RLS FOR SAVED WORDS
-- =============================================

ALTER TABLE public.saved_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved words" ON public.saved_words
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved words" ON public.saved_words
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved words" ON public.saved_words
    FOR DELETE USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_saved_words_user ON public.saved_words(user_id);
