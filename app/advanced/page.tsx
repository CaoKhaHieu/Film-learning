import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getAllMoviesByDifficulty } from '@/service/movie';
import { transformMovieForRow } from '@/service/movie-utils';
import { MovieCard } from "@/components/MovieCard";

export const metadata = {
  title: 'Phim Cấp Độ Nâng Cao - Film Learning',
  description: 'Danh sách phim tiếng Anh dành cho người học nâng cao',
};

export default async function AdvancedPage() {
  // Fetch all advanced movies from service
  const movieList = await getAllMoviesByDifficulty('advanced');

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <div className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Phim Cấp Độ Nâng Cao
          </h1>
          <p className="text-slate-600 text-lg max-w-3xl leading-relaxed">
            Danh sách phim tiếng Anh dành cho người học nâng cao. Những bộ phim này có từ vựng chuyên sâu,
            tốc độ nói nhanh và nội dung phức tạp, thách thức kỹ năng nghe hiểu và mở rộng vốn từ vựng của bạn.
          </p>
        </div>

        {/* Movies Grid */}
        {movieList.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {movieList.map((movie) => (
              <MovieCard key={movie.id} {...transformMovieForRow(movie)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg">Chưa có phim nào trong danh mục này.</p>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
