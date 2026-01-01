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

  // Select a random movie from the fetched movies
  let randomMovie: Movie | null = null;
  if (movies && movies.length > 0) {
    const randomIndex = Math.floor(Math.random() * movies.length);
    randomMovie = movies[randomIndex];
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
    <div className="relative h-[85vh] w-full overflow-hidden bg-slate-50 flex items-center">
      {/* Background Image with sophisticated fade */}
      <div className="absolute inset-0 w-full h-full flex justify-end">
        <div className="relative w-full md:w-[70%] h-full overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center animate-slow-zoom"
            style={{
              backgroundImage: `url('${randomMovie.background_image || randomMovie.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2525&auto=format&fit=crop'}')`,
            }}
          />
          {/* Sharper Masking: Solid white on the far left, clear image on the right */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent via-20% to-70% z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50/40 via-transparent to-transparent z-10" />
        </div>
      </div>

      {/* Content Area */}
      <div className="relative z-20 container mx-auto px-4 md:px-16 pt-20">
        <div className="max-w-2xl space-y-6 animate-fade-in-up">

          {/* Metadata Badges */}
          <div className="flex items-center gap-4 text-[10px] font-black tracking-[0.15em] uppercase text-slate-400">
            {/* IMDb Badge */}
            <div className="flex items-center bg-yellow-400 text-slate-900 px-2 py-0.5 rounded-sm shadow-sm">
              <span className="mr-1">IMDb</span>
              <span className="text-slate-900">{randomMovie.vote_average ? randomMovie.vote_average.toFixed(1) : 'N/A'}</span>
            </div>

            {/* Year & Duration */}
            <div className="flex items-center gap-3">
              <span>{randomMovie.release_date ? new Date(randomMovie.release_date).getFullYear() : 2025}</span>
              <span className="w-1 h-1 bg-yellow-400 rounded-full" />
              <span>
                {randomMovie.runtime ? `${Math.floor(randomMovie.runtime / 60)}h ${randomMovie.runtime % 60}m` : '2h 15m'}
              </span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] drop-shadow-sm">
              {randomMovie.title_vi || randomMovie.title}
            </h1>

            <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-lg font-medium border-l-4 border-yellow-400 pl-4 line-clamp-3">
              {randomMovie.overview || 'Khám phá bộ phim tuyệt vời này và học tiếng Anh qua phim một cách hiệu quả.'}
            </p>
          </div>

          {/* Genres */}
          {randomMovie.genres && (
            <div className="flex flex-wrap gap-2">
              {randomMovie.genres.split(',').map((genre) => (
                <span
                  key={genre.trim()}
                  className="px-4 py-1.5 bg-white text-slate-500 rounded-full text-[9px] font-black tracking-wider uppercase border border-slate-100 shadow-sm hover:border-yellow-400 hover:text-yellow-600 transition-all cursor-default"
                >
                  {genre.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="pt-4">
            <Link href={`/movie/${randomMovie.id}`}>
              <button className="group relative flex items-center gap-4 bg-slate-900 text-white px-8 py-4 rounded-xl font-black shadow-xl shadow-slate-900/30 transition-all hover:scale-[1.02] hover:bg-black cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/10 to-yellow-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="bg-yellow-400 p-1.5 rounded-lg group-hover:rotate-[360deg] transition-transform duration-700">
                  <Play className="w-5 h-5 fill-slate-900 text-slate-900" />
                </div>
                <span className="text-lg tracking-tight">Bắt đầu học ngay</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-bounce pointer-events-none">
        <span className="text-slate-400 text-[10px] font-medium uppercase tracking-[0.2em]">Scroll</span>
        <ChevronDown className="w-6 h-6 text-slate-400" />
      </div>
    </div>

  );
}

