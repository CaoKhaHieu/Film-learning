import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getAllMoviesByDifficulty } from '@/service/movie';
import { MovieListWithLoadMore } from "@/components/MovieListWithLoadMore";

export const metadata = {
  title: 'Phim Cấp Độ Nâng Cao - Film Learning',
  description: 'Danh sách phim tiếng Anh dành cho người học nâng cao',
};

export default async function AdvancedPage() {
  // Fetch initial batch of advanced movies (20 items)
  const initialMovies = await getAllMoviesByDifficulty('advanced', 0, 20);

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

        {/* Movies Grid with Load More */}
        <MovieListWithLoadMore
          initialMovies={initialMovies}
          difficulty="advanced"
          itemsPerPage={20}
        />
      </div>

      <Footer />
    </main>
  );
}
