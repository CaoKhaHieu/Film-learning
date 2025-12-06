# 🎬 Movie Crawler Tools - Quick Reference

## 🚀 Quick Start (4 Steps)

### 1️⃣ Discover Movies
```bash
node tools/discover-movies.js 5
```
→ Lấy 100 movie IDs từ TMDB và lưu vào `movie-ids.txt`

### 2️⃣ Crawl Movie Metadata
```bash
node tools/crawl-movies-batch.js tools/movie-ids.txt
```
→ Crawl thông tin cơ bản (title, overview, poster...) và tạo file CSV

### 3️⃣ Import Metadata to Supabase
```bash
node tools/import-movies.js
```
→ Import thông tin phim từ CSV vào bảng `movies`

### 4️⃣ Crawl Stream & Subtitles
```bash
node tools/get-stream-links.js
```
→ Crawl m3u8, tải & dịch phụ đề, upload lên Storage và cập nhật DB.
→ **Lưu ý**: Chỉ lưu khi có đủ m3u8 + Sub English + Sub Vietnamese.
→ Log lỗi tại `output/error.log`.

---

## 🛠️ Available Scripts

### discover-movies.js
Tự động lấy movie IDs từ TMDB discover API

```bash
node tools/discover-movies.js [pages]
```

### crawl-movies-batch.js
Crawl thông tin cơ bản của phim từ file IDs

```bash
node tools/crawl-movies-batch.js tools/movie-ids.txt
```

### import-movies.js
Import dữ liệu cơ bản từ CSV vào Supabase

```bash
node tools/import-movies.js [optional_file_path]
```

### get-stream-links.js
Crawl video stream và xử lý phụ đề (Download -> Upload -> Translate -> Save DB)

```bash
node tools/get-stream-links.js
```
*   Đọc IDs từ `tools/movie-ids.txt`
*   Crawl link m3u8
*   Crawl sub English -> Download -> Upload Storage
*   Translate sub English -> Vietnamese -> Upload Storage
*   Lưu link stream và link sub vào DB
*   **Yêu cầu**: Phải chạy bước 3 (Import Metadata) trước để có record trong DB.

---

## 📊 Data Fields

| Field | Description |
|-------|-------------|
| `tmdb_id` | TMDB Movie ID (unique) |
| `title` | Original English title |
| `title_vi` | Vietnamese title |
| `release_date` | Release date |
| `vote_average` | TMDB rating |
| `video_url` | HLS Stream URL (.m3u8) |
| ... | ... |

---

## 💡 Common Workflows

### Full Automation
```bash
# 1. Discover
node tools/discover-movies.js 10

# 2. Crawl Metadata
node tools/crawl-movies-batch.js tools/movie-ids.txt

# 3. Import Metadata
node tools/import-movies.js

# 4. Crawl Stream & Subtitles
node tools/get-stream-links.js
```
