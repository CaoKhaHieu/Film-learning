import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { MovieRow } from "@/components/MovieRow";
import { Top10Row } from "@/components/Top10Row";
import { Footer } from "@/components/Footer";
import { ContinueWatchingRow } from "@/components/ContinueWatchingRow";
import { getHomepageMovies } from '@/service/movie';

export default async function Home() {
  // Get all homepage data from service
  const { beginnerMovies, intermediateMovies, advancedMovies, topMovies } = await getHomepageMovies();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <Hero />

      <div className="container mx-auto px-4 py-12 space-y-16">
        <ContinueWatchingRow />
        <Top10Row title="Top 5 Phim Nên Học" movies={topMovies} />
        <MovieRow title="Phim Cấp Độ Cơ Bản (Beginner)" movies={beginnerMovies} href="/beginner" />
        <MovieRow title="Phim Cấp Độ Trung Cấp (Intermediate)" movies={intermediateMovies} href="/intermediate" />
        <MovieRow title="Phim Cấp Độ Nâng Cao (Advanced)" movies={advancedMovies} href="/advanced" />
      </div>

      <Footer />
    </main>
  );
}

