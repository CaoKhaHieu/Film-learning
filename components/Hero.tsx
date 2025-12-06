import Link from "next/link";
import { Play, ChevronDown } from "lucide-react";
import { createClient, type Movie } from '@/lib/supabase-server';

export async function Hero() {
  const supabase = await createClient();

  // Fetch all movies and select one randomly
  const { data: movies, error } = await supabase
    .from('movies')
    .select('*');

  // Debug logging
  if (error) {
    console.error('Error fetching movies:', error);
  }
  console.log('Fetched movies count:', movies?.length || 0);

  // Select a random movie from the fetched movies
  let randomMovie: Movie | null = null;
  if (movies && movies.length > 0) {
    const randomIndex = Math.floor(Math.random() * movies.length);
    randomMovie = movies[randomIndex];
    console.log('Selected random movie:', randomMovie?.title);
  }


  // If no movie found, show empty state
  if (!randomMovie) {
    return (
      <div className="relative h-screen w-full overflow-hidden bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white">Chưa có phim nào trong database</h2>
          <p className="text-slate-400">Vui lòng thêm phim vào database để hiển thị Hero section</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-900">
      {/* Background Image Area */}
      <div className="absolute inset-0 w-full h-full">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: `url('${randomMovie.background_image || randomMovie.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2525&auto=format&fit=crop'}')`,
          }}
        />
        {/* Simple gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
      </div>

      {/* Content Area */}
      <div className="relative z-10 container mx-auto px-4 md:px-16 h-full flex flex-col justify-center">
        <div className="max-w-3xl space-y-6 animate-fade-in-up">

          {/* Metadata Badges */}
          <div className="flex items-center gap-3 text-sm font-bold text-white flex-wrap">
            {/* IMDb Badge */}
            <div className="flex items-center border border-yellow-400 rounded px-2 py-0.5 gap-1.5 bg-black/20 backdrop-blur-sm">
              <span className="text-yellow-400 font-black">IMDb</span>
              <span>{randomMovie.vote_average ? randomMovie.vote_average.toFixed(1) : 'N/A'}</span>
            </div>

            {/* Year */}
            <span className="border border-white/30 px-2 py-0.5 rounded bg-black/20 backdrop-blur-sm">
              {randomMovie.release_date ? new Date(randomMovie.release_date).getFullYear() : 2025}
            </span>

            {/* Duration */}
            {randomMovie.runtime && (
              <span className="border border-white/30 px-2 py-0.5 rounded bg-black/20 backdrop-blur-sm">
                {Math.floor(randomMovie.runtime / 60)}h {randomMovie.runtime % 60}m
              </span>
            )}
          </div>

          {/* Genres */}
          {randomMovie.genres && (
            <div className="flex flex-wrap gap-2">
              {randomMovie.genres.split(',').map((genre) => (
                <span
                  key={genre.trim()}
                  className="px-3 py-1.5 bg-white/5 backdrop-blur-sm text-slate-200 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer border border-white/20 hover:bg-white/20 hover:border-white/50 hover:text-white hover:scale-105"
                >
                  {genre.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight mb-4">
              {randomMovie.title_vi || randomMovie.title}
            </h1>

            <p className="text-slate-300 text-base leading-relaxed max-w-2xl line-clamp-3 font-medium drop-shadow-sm">
              {randomMovie.overview || 'Khám phá bộ phim tuyệt vời này và học tiếng Anh qua phim một cách hiệu quả.'}
            </p>
          </div>

          {/* Actions */}
          <div className="pt-6 flex items-center gap-6">
            <Link href={`/movie/${randomMovie.id}`}>
              <button className="group relative w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg shadow-yellow-400/20 transition-all hover:scale-110 hover:shadow-yellow-400/40 cursor-pointer">
                <Play className="w-8 h-8 fill-slate-900 text-slate-900 ml-1 transition-transform group-hover:scale-110" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-bounce pointer-events-none">
        <span className="text-white/50 text-[10px] font-medium uppercase tracking-[0.2em]">Scroll</span>
        <ChevronDown className="w-6 h-6 text-white/50" />
      </div>
    </div>
  );
}

