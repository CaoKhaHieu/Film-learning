import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { MovieRow } from "@/components/MovieRow";
import { Top10Row } from "@/components/Top10Row";
import { Footer } from "@/components/Footer";
import { getHomepageMovies } from '@/service/movie';

export default async function Home() {
  // Get all homepage data from service
  const { beginnerMovies, intermediateMovies, advancedMovies, topMovies } = await getHomepageMovies();

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <Navbar />
      <Hero />

      <div className="mt-[-100px] relative z-20 space-y-8">
        <div className="bg-linear-to-r from-yellow-900/20 to-transparent py-4">
          <Top10Row title="Top 5 Phim Nên Học" movies={topMovies} />
        </div>
        <MovieRow title="Phim Cấp Độ Cơ Bản (Beginner)" movies={beginnerMovies} />
        <MovieRow title="Phim Cấp Độ Trung Cấp (Intermediate)" movies={intermediateMovies} />
        <MovieRow title="Phim Cấp Độ Nâng Cao (Advanced)" movies={advancedMovies} />
      </div>

      <Footer />
    </main>
  );
}

