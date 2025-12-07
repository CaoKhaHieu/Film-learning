import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getAllMoviesByDifficulty } from '@/service/movie';
import { MovieListWithLoadMore } from "@/components/MovieListWithLoadMore";

export const metadata = {
  title: 'Phim Cấp Độ Cơ Bản - Film Learning',
  description: 'Danh sách phim tiếng Anh dành cho người mới bắt đầu',
};

export default async function BeginnerPage() {
  // Fetch initial batch of beginner movies (20 items)
  const initialMovies = await getAllMoviesByDifficulty('beginner', 0, 20);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <div className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Phim Cấp Độ Cơ Bản
          </h1>
          <p className="text-slate-600 text-lg max-w-3xl leading-relaxed">
            Danh sách phim tiếng Anh dành cho người mới bắt đầu. Những bộ phim này có từ vựng đơn giản,
            tốc độ nói chậm và nội dung dễ hiểu, phù hợp để bắt đầu hành trình học tiếng Anh qua phim.
          </p>
        </div>

        {/* Movies Grid with Load More */}
        <MovieListWithLoadMore
          initialMovies={initialMovies}
          difficulty="beginner"
          itemsPerPage={20}
        />
      </div>

      <Footer />
    </main>
  );
}
