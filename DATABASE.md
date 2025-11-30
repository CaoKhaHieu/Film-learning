# Database Schema Documentation - MVP
## Film Learning Platform - Simplified Version

## 📋 Tổng Quan

Database MVP tập trung vào **quản lý phim và phụ đề song ngữ** - những tính năng cốt lõi nhất.

**Đã loại bỏ:**
- ❌ User profiles & authentication
- ❌ Watch history & progress tracking
- ❌ Vocabulary learning system
- ❌ User favorites & reviews
- ❌ Learning sessions & analytics

**Giữ lại:**
- ✅ Movies & Series management
- ✅ Episodes & Seasons
- ✅ Video sources (HLS)
- ✅ Dual subtitles (EN/VI)
- ✅ Genres

## 🗂️ Cấu Trúc Database

### 1. **Movies**

#### `movies`
Bảng chính chứa thông tin phim/series
```sql
- id: UUID
- title: Tên phim (tiếng Việt)
- original_title: Tên gốc
- slug: URL-friendly identifier
- type: 'movie' hoặc 'series'
- description: Mô tả
- poster_url: Ảnh poster
- backdrop_url: Ảnh nền
- trailer_url: Link trailer
- release_year: Năm phát hành
- duration: Thời lượng (phút)
- imdb_rating: Điểm IMDB
- age_rating: Phân loại độ tuổi
- country: Quốc gia
- language: Ngôn ngữ gốc
- difficulty_level: Độ khó (beginner/intermediate/advanced)
- is_featured: Phim nổi bật
- is_published: Đã xuất bản
- view_count: Lượt xem
```

#### `genres`
Thể loại phim
```sql
- id: UUID
- name: Tên thể loại (Hành Động, Hài, etc.)
- slug: URL slug
```

#### `movie_genres`
Bảng trung gian many-to-many
- Một phim có nhiều thể loại
- Một thể loại có nhiều phim

### 2. **Episodes (cho Series)**

#### `seasons`
Mùa phim
```sql
- id: UUID
- movie_id: FK to movies
- season_number: Số mùa (1, 2, 3...)
- title: Tên mùa
- poster_url: Ảnh poster mùa
```

#### `episodes`
Tập phim
```sql
- id: UUID
- season_id: FK to seasons
- episode_number: Số tập
- title: Tên tập
- description: Mô tả
- thumbnail_url: Ảnh thumbnail
- duration: Thời lượng (giây)
- is_published: Đã xuất bản
```

### 3. **Video & Subtitles**

#### `video_sources`
Nguồn video HLS
```sql
- id: UUID
- movie_id: FK (cho phim lẻ)
- episode_id: FK (cho phim bộ)
- quality: '360p', '720p', '1080p', '4k'
- url: Link .m3u8
- is_default: Chất lượng mặc định
```

**Lưu ý:** Mỗi video source chỉ thuộc về movie HOẶC episode (không cả hai)

#### `subtitles`
Phụ đề song ngữ
```sql
- id: UUID
- movie_id: FK (cho phim lẻ)
- episode_id: FK (cho phim bộ)
- language: 'en', 'vi'
- label: 'English', 'Tiếng Việt'
- url: Link file .vtt
- is_default: Phụ đề mặc định
```

## 📊 Views

### `movies_with_genres`
Phim kèm thông tin thể loại
```sql
SELECT * FROM movies_with_genres 
WHERE slug = 'conan-movie';
-- Returns: movie data + genres array
```

### `episodes_full`
Episodes kèm thông tin season và movie
```sql
SELECT * FROM episodes_full 
WHERE movie_slug = 'conan-series';
-- Returns: episode + season_number + movie info
```

## 🔐 Security (RLS)

**Public Read Access** - Phù hợp cho MVP:
- ✅ Tất cả users (kể cả anonymous) có thể đọc dữ liệu
- ✅ Chỉ hiển thị content đã publish
- ❌ Không ai có thể write (chỉ admin qua Supabase dashboard)

## � Use Cases

### 1. **Lấy danh sách phim**
```sql
-- Phim nổi bật
SELECT * FROM movies_with_genres 
WHERE is_featured = TRUE 
AND is_published = TRUE 
ORDER BY created_at DESC;

-- Phim theo thể loại
SELECT * FROM movies_with_genres 
WHERE 'Hành Động' = ANY(genres)
AND is_published = TRUE;

-- Phim theo độ khó
SELECT * FROM movies 
WHERE difficulty_level = 'beginner'
AND is_published = TRUE;
```

### 2. **Lấy chi tiết phim**
```sql
-- Phim lẻ
SELECT m.*, 
       vs.url as video_url,
       vs.quality,
       s.url as subtitle_url,
       s.language
FROM movies m
LEFT JOIN video_sources vs ON m.id = vs.movie_id
LEFT JOIN subtitles s ON m.id = s.movie_id
WHERE m.slug = 'john-wick-4';

-- Phim bộ với episodes
SELECT m.*,
       s.season_number,
       e.episode_number,
       e.title as episode_title
FROM movies m
JOIN seasons s ON m.id = s.movie_id
JOIN episodes e ON s.id = e.season_id
WHERE m.slug = 'breaking-bad'
ORDER BY s.season_number, e.episode_number;
```

### 3. **Lấy video và phụ đề**
```sql
-- Cho một episode cụ thể
SELECT 
    vs.url as video_url,
    vs.quality,
    json_agg(json_build_object(
        'language', s.language,
        'label', s.label,
        'url', s.url
    )) as subtitles
FROM episodes e
LEFT JOIN video_sources vs ON e.id = vs.episode_id
LEFT JOIN subtitles s ON e.id = s.episode_id
WHERE e.id = 'episode-uuid'
GROUP BY vs.url, vs.quality;
```

## 🛠️ Setup Instructions

### 1. Tạo Supabase Project
- Đăng ký tại [supabase.com](https://supabase.com)
- Tạo project mới

### 2. Run Migration
```bash
# Copy nội dung supabase-schema.sql
# Vào Supabase Dashboard > SQL Editor
# Paste và Run
```

### 3. Configure Storage (Optional)
Nếu muốn upload files lên Supabase Storage:
```bash
# Tạo buckets:
- movies-posters
- movies-backdrops
- subtitles
```

### 4. Get Connection Info
```bash
# Trong Supabase Dashboard > Settings > API
- Project URL
- anon/public key
```

## 📝 Sample Data Structure

### Phim lẻ (Movie)
```json
{
  "title": "John Wick 4",
  "slug": "john-wick-4",
  "type": "movie",
  "duration": 169,
  "difficulty_level": "intermediate",
  "genres": ["Hành Động", "Phiêu Lưu"]
}
```

### Phim bộ (Series)
```json
{
  "title": "Breaking Bad",
  "slug": "breaking-bad",
  "type": "series",
  "difficulty_level": "advanced",
  "seasons": [
    {
      "season_number": 1,
      "episodes": [
        {
          "episode_number": 1,
          "title": "Pilot",
          "duration": 3480
        }
      ]
    }
  ]
}
```

## 🎯 Next Steps

1. **Tích hợp Supabase vào Next.js**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Tạo Supabase client**
   ```typescript
   // lib/supabase.ts
   import { createClient } from '@supabase/supabase-js'
   
   export const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   )
   ```

3. **Fetch movies**
   ```typescript
   const { data: movies } = await supabase
     .from('movies_with_genres')
     .select('*')
     .eq('is_published', true)
     .order('created_at', { ascending: false })
   ```

## 🚀 Mở Rộng Sau (Post-MVP)

Khi cần scale, có thể thêm lại:
- User authentication & profiles
- Watch history & bookmarks
- Vocabulary learning
- Comments & ratings
- Analytics

---

**MVP Focus**: Xây dựng nhanh, test ý tưởng, thu thập feedback từ users trước khi đầu tư vào các tính năng phức tạp.
