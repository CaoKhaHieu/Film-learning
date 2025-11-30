import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { MovieRow } from "@/components/MovieRow";
import { Top10Row } from "@/components/Top10Row";
import { Footer } from "@/components/Footer";
import { createClient, type Movie } from '@/lib/supabase-server';


// Transform DB movie to component format for MovieRow
function transformMovieForRow(movie: Movie) {
  return {
    id: movie.id,
    title: movie.title,
    image: movie.poster || "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=500&q=60",
    isNew: false,
    quality: movie.is_vip ? "VIP" : "HD",
    year: new Date(movie.created_at).getFullYear().toString(),
  };
}

// Transform DB movie to component format for Top10Row
function transformMovieForTop10(movie: Movie, rank: number) {
  return {
    id: movie.id,
    title: movie.title,
    image: movie.poster || "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=500&q=60",
    rank: rank,
  };
}

export default async function Home() {
  const supabase = await createClient();

  // Fetch movies by difficulty level
  const [beginnerMovies, intermediateMovies, advancedMovies, latestMovies] = await Promise.all([
    // Beginner movies (max 10)
    supabase
      .from('movies')
      .select('*')
      .eq('difficulty_level', 'beginner')
      .limit(10)
      .then(({ data }) => data || []),

    // Intermediate movies (max 10)
    supabase
      .from('movies')
      .select('*')
      .eq('difficulty_level', 'intermediate')
      .limit(10)
      .then(({ data }) => data || []),

    // Advanced movies (max 10)
    supabase
      .from('movies')
      .select('*')
      .eq('difficulty_level', 'advanced')
      .limit(10)
      .then(({ data }) => data || []),

    // Latest 5 movies for top section
    supabase
      .from('movies')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => data || [])
  ]);

  // Transform data for components
  const beginnerData = beginnerMovies.map(transformMovieForRow);
  const intermediateData = intermediateMovies.map(transformMovieForRow);
  const advancedData = advancedMovies.map(transformMovieForRow);
  const topMoviesData = latestMovies.map((movie, index) => transformMovieForTop10(movie, index + 1));

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <Navbar />
      <Hero />

      <div className="mt-[-100px] relative z-20 space-y-8">
        <div className="bg-gradient-to-r from-yellow-900/20 to-transparent py-4">
          <Top10Row title="Top 5 Phim Nên Học" movies={topMoviesData} />
        </div>
        <MovieRow title="Phim Cấp Độ Cơ Bản (Beginner)" movies={beginnerData} />
        <MovieRow title="Phim Cấp Độ Trung Cấp (Intermediate)" movies={intermediateData} />
        <MovieRow title="Phim Cấp Độ Nâng Cao (Advanced)" movies={advancedData} />
      </div>

      <Footer />
    </main>
  );
}

