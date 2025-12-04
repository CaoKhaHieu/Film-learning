# Movie Crawler Tool

Script để crawl dữ liệu phim từ TMDB API thông qua Flixer proxy.

## Cài đặt

Script sử dụng Node.js built-in modules, không cần cài đặt thêm dependencies.

## Sử dụng

### Cú pháp cơ bản

```bash
node tools/crawl-movies.js <movie_id1> <movie_id2> <movie_id3> ...
```

### Ví dụ

Crawl một phim:
```bash
node tools/crawl-movies.js 1038392
```

Crawl nhiều phim cùng lúc:
```bash
node tools/crawl-movies.js 1038392 550 13 278 680
```

### Batch Crawl (từ file)

Tạo file text chứa danh sách movie IDs (một ID mỗi dòng):
```bash
node tools/crawl-movies-batch.js tools/movie-ids.txt
```

Format file `movie-ids.txt`:
```
# Dòng bắt đầu bằng # là comment
1038392
550
278
680
```

## Tự Động Lấy Movie IDs

### Discover Movies từ TMDB

Sử dụng script `discover-movies.js` để tự động lấy danh sách movie IDs phổ biến:

```bash
# Lấy 1 trang (20 movies)
node tools/discover-movies.js 1

# Lấy 5 trang (100 movies)
node tools/discover-movies.js 5

# Lấy 10 trang (200 movies)
node tools/discover-movies.js 10
```

Script sẽ:
- Fetch movies từ TMDB discover API
- Lưu IDs vào `tools/movie-ids.txt`
- Hiển thị thống kê và top rated movies
- Sẵn sàng để crawl với `crawl-movies-batch.js`

### Workflow Hoàn Chỉnh

```bash
# Bước 1: Discover movies
node tools/discover-movies.js 5

# Bước 2: Crawl movie data
node tools/crawl-movies-batch.js tools/movie-ids.txt

# Bước 3: Import CSV vào Supabase
```

## Dữ liệu được lấy

Script sẽ lấy các thông tin sau từ API:

- `tmdb_id` - TMDB Movie ID (unique)
- `title` - Tên gốc (original_title)
- `title_vi` - Tên tiếng Việt (title)
- `release_date` - Ngày phát hành
- `runtime` - Thời lượng (phút)
- `vote_average` - Điểm đánh giá
- `genres` - Thể loại
- `background_image` - Ảnh nền (backdrop_path)
- `poster` - Ảnh poster (poster_path)
- `difficulty_level` - Mức độ (mặc định: "beginner")
- `is_vip` - VIP hay không (mặc định: false)
- `overview` - Mô tả phim

## Output

Script sẽ tạo file CSV trong thư mục `tools/output/`:

**CSV** (`movies-{timestamp}.csv`) - File CSV để import vào Supabase

## Import vào Supabase

### Sử dụng CSV Import (Recommended)

1. Mở Supabase Dashboard
2. Vào Table Editor → movies table
3. Click "Insert" → "Import data from CSV"
4. Upload file `.csv` từ `tools/output/`
5. Map các columns tương ứng

## Lưu ý

- Script có delay 1 giây giữa các request để tránh spam API
- Nếu một movie ID không tồn tại hoặc lỗi, script sẽ bỏ qua và tiếp tục với ID tiếp theo
- Ảnh backdrop và poster sẽ được lưu dưới dạng URL đầy đủ từ TMDB CDN

## Tìm Movie ID

### Cách 1: Sử dụng Search Tool (Recommended)

```bash
node tools/search-movies.js "inception"
node tools/search-movies.js "the dark knight"
```

Tool sẽ hiển thị kết quả tìm kiếm với ID và thông tin chi tiết, kèm theo lệnh crawl sẵn để copy.

### Cách 2: Từ TMDB Website

Bạn có thể tìm Movie ID từ:
- URL trên TMDB: `https://www.themoviedb.org/movie/{id}`
- Hoặc search trên API: `https://plsdontscrapemelove.flixer.sh/api/tmdb/search/movie?query={movie_name}`

## Ví dụ Movie IDs phổ biến

- The Shawshank Redemption: 278
- The Godfather: 238
- The Dark Knight: 155
- Pulp Fiction: 680
- Fight Club: 550
- Inception: 27205
- The Matrix: 603
- Interstellar: 157336
