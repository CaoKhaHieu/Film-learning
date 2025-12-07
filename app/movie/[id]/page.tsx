import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MovieRow } from "@/components/MovieRow";
import { Button } from "@/components/ui/button";
import { Play, Clock, Calendar, Star, Globe } from "lucide-react";
import { notFound } from 'next/navigation';
import { getMovieDetails } from '@/service/movie';

export default async function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Get movie details from service
  const movieData = await getMovieDetails(id);

  // If movie not found, show 404
  if (!movieData) {
    notFound();
  }

  const { movie, relatedMovies, difficultyLabel } = movieData;

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Backdrop Hero */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden bg-slate-900">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${movie.background_image || movie.poster || ''}')`,
          }}
        />
        {/* Subtle bottom gradient for smooth transition */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent" />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 -mt-48 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Left Column - Poster */}
          <div className="lg:col-span-3">
            <div className="sticky top-24">
              {/* Poster Card */}
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 max-w-[270px]">
                <div className="aspect-[2/3] relative">
                  <img
                    src={movie.poster || ''}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                  {movie.is_vip && (
                    <div className="absolute top-4 right-4 bg-purple-500 text-white px-3 py-1.5 rounded-lg font-bold text-sm shadow-lg">
                      VIP
                    </div>
                  )}
                </div>

                {/* Watch Button */}
                <div className="p-4">
                  <Link href={`/movie/${movie.id}/watch`} className="block">
                    <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold text-lg h-14 rounded-xl shadow-lg hover:shadow-xl transition-all">
                      <Play className="w-5 h-5 mr-2 fill-slate-900" />
                      Xem Phim
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 bg-white rounded-xl shadow-lg p-5 border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">Thông Tin</h3>
                <div className="space-y-3 text-sm">
                  {movie.vote_average && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        Đánh giá
                      </span>
                      <span className="font-bold text-slate-900">{movie.vote_average.toFixed(1)}/10</span>
                    </div>
                  )}

                  {movie.runtime && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        Thời lượng
                      </span>
                      <span className="font-bold text-slate-900">
                        {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      Năm
                    </span>
                    <span className="font-bold text-slate-900">
                      {movie.release_date ? new Date(movie.release_date).getFullYear() : new Date(movie.created_at).getFullYear()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 flex items-center gap-2">
                      <Star className="w-4 h-4 text-slate-500" />
                      Cấp độ
                    </span>
                    <span className="font-bold text-yellow-600">{difficultyLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-9 space-y-8">
            {/* Title Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
              <div className="space-y-4">
                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1.5 bg-yellow-400 text-slate-900 rounded-lg font-bold text-sm shadow-sm">
                    {difficultyLabel}
                  </span>
                  {movie.genres && movie.genres.split(',').slice(0, 3).map((genre) => (
                    <span
                      key={genre.trim()}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium border border-slate-200"
                    >
                      {genre.trim()}
                    </span>
                  ))}
                </div>

                {/* Titles */}
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-2">
                    {movie.title_vi || movie.title}
                  </h1>
                  {movie.title_vi && (
                    <h2 className="text-lg md:text-xl font-semibold text-slate-500">
                      {movie.title}
                    </h2>
                  )}
                </div>

                {/* Overview */}
                <p className="text-slate-700 text-base leading-relaxed">
                  {movie.overview || 'Khám phá bộ phim tuyệt vời này và học tiếng Anh qua phim một cách hiệu quả.'}
                </p>
              </div>
            </div>

            {/* Learning Highlights */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
              <h2 className="text-xl font-black text-slate-900 mb-6">Phù Hợp Cho Việc Học</h2>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 mt-1.5"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">
                      {movie.difficulty_level === 'beginner' && 'Giọng nói rõ ràng, tốc độ chậm'}
                      {movie.difficulty_level === 'intermediate' && 'Giọng nói tự nhiên, tốc độ vừa phải'}
                      {movie.difficulty_level === 'advanced' && 'Giọng nói nhanh, nhiều giọng địa phương'}
                    </h3>
                    <p className="text-slate-600 text-sm">
                      {movie.difficulty_level === 'beginner' && 'Phát âm chuẩn, dễ nghe và bắt chước. Thích hợp để làm quen với tiếng Anh giao tiếp.'}
                      {movie.difficulty_level === 'intermediate' && 'Nhịp độ hội thoại thực tế, giúp làm quen với cách nói của người bản xứ.'}
                      {movie.difficulty_level === 'advanced' && 'Thử thách khả năng nghe hiểu với nhiều giọng nói và tốc độ khác nhau.'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 mt-1.5"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">
                      {movie.difficulty_level === 'beginner' && 'Từ vựng cơ bản, thông dụng'}
                      {movie.difficulty_level === 'intermediate' && 'Từ vựng phong phú, đa dạng'}
                      {movie.difficulty_level === 'advanced' && 'Từ vựng chuyên sâu, thành ngữ'}
                    </h3>
                    <p className="text-slate-600 text-sm">
                      {movie.difficulty_level === 'beginner' && 'Các từ vựng hàng ngày, dễ nhớ và áp dụng ngay vào giao tiếp.'}
                      {movie.difficulty_level === 'intermediate' && 'Mở rộng vốn từ với nhiều chủ đề và ngữ cảnh khác nhau.'}
                      {movie.difficulty_level === 'advanced' && 'Học từ vựng nâng cao, thành ngữ và cách diễn đạt phức tạp.'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 mt-1.5"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">
                      {movie.difficulty_level === 'beginner' && 'Dành cho người mới bắt đầu'}
                      {movie.difficulty_level === 'intermediate' && 'Dành cho người có nền tảng'}
                      {movie.difficulty_level === 'advanced' && 'Dành cho người muốn nâng cao'}
                    </h3>
                    <p className="text-slate-600 text-sm">
                      {movie.difficulty_level === 'beginner' && 'Bạn chưa có nhiều kinh nghiệm với tiếng Anh? Đây là điểm khởi đầu tuyệt vời.'}
                      {movie.difficulty_level === 'intermediate' && 'Bạn đã có kiến thức cơ bản? Hãy nâng cấp kỹ năng lên tầm cao mới.'}
                      {movie.difficulty_level === 'advanced' && 'Bạn muốn thử thách bản thân? Phim này sẽ giúp bạn tiến xa hơn.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Movie Details */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
              <h2 className="text-xl font-black text-slate-900 mb-6">Chi Tiết Phim</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* All Genres */}
                {movie.genres && (
                  <div>
                    <h3 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">Thể Loại</h3>
                    <div className="flex flex-wrap gap-2">
                      {movie.genres.split(',').map((genre) => (
                        <span
                          key={genre.trim()}
                          className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium border border-slate-200 hover:bg-slate-200 transition-colors"
                        >
                          {genre.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Language */}
                <div>
                  <h3 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">Ngôn Ngữ</h3>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium border border-slate-200">
                    <Globe className="w-4 h-4" />
                    Tiếng Anh
                  </span>
                </div>

                {/* Subtitles */}
                <div>
                  <h3 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">Phụ Đề</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium border border-slate-200">
                      English
                    </span>
                    <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium border border-slate-200">
                      Tiếng Việt
                    </span>
                  </div>
                </div>

                {/* Quality */}
                <div>
                  <h3 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">Chất Lượng</h3>
                  <span className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-sm font-bold border border-slate-900">
                    HD
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Movies Section */}
        <div className="py-12">
          <MovieRow
            title={`Phim Cùng Cấp Độ ${difficultyLabel}`}
            movies={relatedMovies}
          />
        </div>
      </div>

      <Footer />
    </main>
  );
}
