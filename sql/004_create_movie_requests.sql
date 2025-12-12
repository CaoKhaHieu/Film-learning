-- Create movie_requests table
CREATE TABLE public.movie_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Link to user if logged in
  movie_title TEXT NOT NULL,
  note TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, completed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.movie_requests ENABLE ROW LEVEL SECURITY;

-- Policies
-- Allow anyone (anon and authenticated) to insert requests
CREATE POLICY "Anyone can insert movie requests" ON public.movie_requests
    FOR INSERT WITH CHECK (true);

-- Allow users to view their own requests
CREATE POLICY "Users can view own requests" ON public.movie_requests
    FOR SELECT USING (auth.uid() = user_id);

-- Allow admins (service_role) to do everything (handled by Supabase default, but good to know)
