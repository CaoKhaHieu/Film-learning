import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getAllMoviesByDifficulty } from '@/service/movie';
import { transformMovieForRow } from '@/service/movie-utils';
import { MovieCard } from "@/components/MovieCard";

export const metadata = {
  title: 'Phim Cấp Độ Trung Cấp - Film Learning',
  description: 'Danh sách phim tiếng Anh dành cho người học trung cấp',
};

export default async function IntermediatePage() {
  // Fetch all intermediate movies from service
  const movieList = await getAllMoviesByDifficulty('intermediate');

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <div className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Phim Cấp Độ Trung Cấp
          </h1>
          <p className="text-slate-600 text-lg max-w-3xl leading-relaxed">
            Danh sách phim tiếng Anh dành cho người học trung cấp. Những bộ phim này có từ vựng phong phú hơn,
            tốc độ nói tự nhiên và nội dung đa dạng, giúp bạn nâng cao kỹ năng nghe hiểu tiếng Anh.
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
