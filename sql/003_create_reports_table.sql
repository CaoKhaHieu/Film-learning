-- Create reports table for storing user-reported issues
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
    movie_title TEXT NOT NULL,
    issue_type TEXT NOT NULL CHECK (issue_type IN (
        'video_not_playing',
        'subtitle_error',
        'wrong_video',
        'audio_sync',
        'video_quality',
        'buffering',
        'subtitle_sync',
        'subtitle_missing',
        'other'
    )),
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reports_movie_id ON public.reports(movie_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_issue_type ON public.reports(issue_type);

-- Enable Row Level Security
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert reports (anonymous users can report issues)
CREATE POLICY "Anyone can insert reports" ON public.reports
    FOR INSERT
    WITH CHECK (true);

-- Policy: Anyone can view reports (for transparency)
CREATE POLICY "Anyone can view reports" ON public.reports
    FOR SELECT
    USING (true);

-- Policy: Only authenticated users can update reports (for admin)
-- You can modify this later to check for admin role
CREATE POLICY "Authenticated users can update reports" ON public.reports
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION public.update_reports_updated_at();

-- Add comment to table
COMMENT ON TABLE public.reports IS 'Stores user-reported issues for movies';
COMMENT ON COLUMN public.reports.issue_type IS 'Type of issue: video_not_playing, subtitle_error, wrong_video, audio_sync, video_quality, buffering, subtitle_sync, subtitle_missing, other';
COMMENT ON COLUMN public.reports.status IS 'Status of the report: pending, in_progress, resolved, dismissed';
