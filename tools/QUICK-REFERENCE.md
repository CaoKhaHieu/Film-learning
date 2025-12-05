# 🎬 Movie Crawler Tools - Quick Reference

## 🚀 Quick Start (3 Steps)

### 1️⃣ Discover Movies
```bash
node tools/discover-movies.js 5
```
→ Lấy 100 movie IDs từ TMDB và lưu vào `movie-ids.txt`

### 2️⃣ Crawl Movie Data
```bash
node tools/crawl-movies-batch.js tools/movie-ids.txt
```
→ Crawl chi tiết từng phim và tạo file CSV

### 3️⃣ Import to Supabase
```bash
node tools/import-movies.js
```
→ Tự động import file CSV mới nhất vào Supabase

---

## 🛠️ Available Scripts

### discover-movies.js
Tự động lấy movie IDs từ TMDB discover API

```bash
node tools/discover-movies.js [pages]
```

### crawl-movies-batch.js
Crawl nhiều phim từ file

```bash
node tools/crawl-movies-batch.js tools/movie-ids.txt
```

### import-movies.js
Import dữ liệu từ CSV vào Supabase

```bash
node tools/import-movies.js [optional_file_path]
```

---

## 📊 Data Fields

| Field | Description |
|-------|-------------|
| `tmdb_id` | TMDB Movie ID (unique) |
| `title` | Original English title |
| `title_vi` | Vietnamese title |
| `release_date` | Release date |
| `vote_average` | TMDB rating |
| ... | ... |

---

## 💡 Common Workflows

### Full Automation
```bash
# 1. Discover
node tools/discover-movies.js 10

# 2. Crawl
node tools/crawl-movies-batch.js tools/movie-ids.txt

# 3. Import
node tools/import-movies.js
```
