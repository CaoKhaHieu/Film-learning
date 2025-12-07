import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getAllMoviesByDifficulty } from '@/service/movie';
import { MovieListWithLoadMore } from "@/components/MovieListWithLoadMore";

export const metadata = {
  title: 'Phim Cấp Độ Trung Cấp - Film Learning',
  description: 'Danh sách phim tiếng Anh dành cho người học trung cấp',
};

export default async function IntermediatePage() {
  // Fetch initial batch of intermediate movies (20 items)
  const initialMovies = await getAllMoviesByDifficulty('intermediate', 0, 20);

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

        {/* Movies Grid with Load More */}
        <MovieListWithLoadMore
          initialMovies={initialMovies}
          difficulty="intermediate"
          itemsPerPage={20}
        />
      </div>

      <Footer />
    </main>
  );
}
