-- =============================================
-- FILM LEARNING DATABASE SCHEMA - MVP VERSION
-- Supabase PostgreSQL Database
-- Simplified for MVP - Focus on Movies & Subtitles
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- MOVIES & CONTENT
-- =============================================

-- Movies/Series table
CREATE TABLE movies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    original_title VARCHAR(500),
    slug VARCHAR(500) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL, -- movie, series
    description TEXT,
    poster_url TEXT,
    backdrop_url TEXT,
    trailer_url TEXT,
    release_year INTEGER,
    duration INTEGER, -- in minutes (for movies)
    imdb_rating DECIMAL(3,1),
    age_rating VARCHAR(10), -- G, PG, PG-13, R, etc.
    country VARCHAR(100),
    language VARCHAR(10) DEFAULT 'en',
    difficulty_level VARCHAR(20), -- beginner, intermediate, advanced
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Genres
CREATE TABLE genres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Movie-Genre relationship (many-to-many)
CREATE TABLE movie_genres (
    movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
    genre_id UUID REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, genre_id)
);

-- =============================================
-- EPISODES (for Series)
-- =============================================

CREATE TABLE seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
    season_number INTEGER NOT NULL,
    title VARCHAR(255),
    poster_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(movie_id, season_number)
);

CREATE TABLE episodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
    episode_number INTEGER NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    duration INTEGER, -- in seconds
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(season_id, episode_number)
);

-- =============================================
-- VIDEO SOURCES & SUBTITLES
-- =============================================

-- Video sources (HLS streams)
CREATE TABLE video_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
    episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
    quality VARCHAR(10) NOT NULL, -- 360p, 480p, 720p, 1080p, 4k
    url TEXT NOT NULL, -- HLS .m3u8 URL
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (
        (movie_id IS NOT NULL AND episode_id IS NULL) OR
        (movie_id IS NULL AND episode_id IS NOT NULL)
    )
);

-- Subtitles (dual language support)
CREATE TABLE subtitles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
    episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
    language VARCHAR(10) NOT NULL, -- en, vi, etc.
    label VARCHAR(100), -- "English", "Tiếng Việt"
    url TEXT NOT NULL, -- VTT file URL
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (
        (movie_id IS NOT NULL AND episode_id IS NULL) OR
        (movie_id IS NULL AND episode_id IS NOT NULL)
    )
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Movies indexes
CREATE INDEX idx_movies_type ON movies(type);
CREATE INDEX idx_movies_slug ON movies(slug);
CREATE INDEX idx_movies_difficulty ON movies(difficulty_level);
CREATE INDEX idx_movies_featured ON movies(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_movies_published ON movies(is_published) WHERE is_published = TRUE;
CREATE INDEX idx_movies_created_at ON movies(created_at DESC);

-- Episodes indexes
CREATE INDEX idx_episodes_season ON episodes(season_id);
CREATE INDEX idx_episodes_published ON episodes(is_published) WHERE is_published = TRUE;

-- Subtitles indexes
CREATE INDEX idx_subtitles_movie ON subtitles(movie_id);
CREATE INDEX idx_subtitles_episode ON subtitles(episode_id);
CREATE INDEX idx_subtitles_language ON subtitles(language);

-- Video sources indexes
CREATE INDEX idx_video_sources_movie ON video_sources(movie_id);
CREATE INDEX idx_video_sources_episode ON video_sources(episode_id);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_movies_updated_at BEFORE UPDATE ON movies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_episodes_updated_at BEFORE UPDATE ON episodes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SAMPLE DATA INSERTION
-- =============================================

-- Insert sample genres
INSERT INTO genres (name, slug) VALUES
    ('Hành Động', 'action'),
    ('Hài', 'comedy'),
    ('Chính Kịch', 'drama'),
    ('Kinh Dị', 'thriller'),
    ('Tình Cảm', 'romance'),
    ('Khoa Học Viễn Tưởng', 'sci-fi'),
    ('Hoạt Hình', 'animation'),
    ('Tài Liệu', 'documentary'),
    ('Bí Ẩn', 'mystery'),
    ('Phiêu Lưu', 'adventure');

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- View for movies with genre information
CREATE OR REPLACE VIEW movies_with_genres AS
SELECT 
    m.*,
    ARRAY_AGG(g.name) FILTER (WHERE g.name IS NOT NULL) as genres,
    ARRAY_AGG(g.slug) FILTER (WHERE g.slug IS NOT NULL) as genre_slugs
FROM movies m
LEFT JOIN movie_genres mg ON m.id = mg.movie_id
LEFT JOIN genres g ON mg.genre_id = g.id
GROUP BY m.id;

-- View for episodes with season and movie info
CREATE OR REPLACE VIEW episodes_full AS
SELECT 
    e.*,
    s.season_number,
    s.movie_id,
    m.title as movie_title,
    m.slug as movie_slug
FROM episodes e
JOIN seasons s ON e.season_id = s.id
JOIN movies m ON s.movie_id = m.id;

-- =============================================
-- ENABLE PUBLIC READ ACCESS (for MVP)
-- =============================================

-- Allow anonymous users to read movies and related content
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE movie_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtitles ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can view published movies" ON movies
    FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Public can view genres" ON genres
    FOR SELECT USING (TRUE);

CREATE POLICY "Public can view movie_genres" ON movie_genres
    FOR SELECT USING (TRUE);

CREATE POLICY "Public can view seasons" ON seasons
    FOR SELECT USING (TRUE);

CREATE POLICY "Public can view published episodes" ON episodes
    FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Public can view video_sources" ON video_sources
    FOR SELECT USING (TRUE);

CREATE POLICY "Public can view subtitles" ON subtitles
    FOR SELECT USING (TRUE);
