import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MovieRow } from "@/components/MovieRow";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { notFound } from 'next/navigation';
import { getMovieDetails } from '@/service/movie';

export default async function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Get movie details from service
  const movieData = await getMovieDetails(id);

  // If movie not found, show 404
  if (!movieData) {
    notFound();
  }

  const { movie, relatedMovies, difficultyLabel } = movieData;

  return (
    <main className="min-h-screen text-white">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[85vh] w-full overflow-hidden bg-slate-900">
        {/* Background Image Area */}
        <div className="absolute inset-0 w-full h-full">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('${movie.background_image || movie.poster || ''}')`,
            }}
          />
          {/* Dark theme gradients for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
        </div>

        {/* Content Area */}
        <div className="relative z-10 container mx-auto px-4 md:px-16 h-full flex flex-col justify-center">
          <div className="max-w-3xl space-y-6 animate-fade-in-up">

            {/* Metadata Badges */}
            <div className="flex items-center gap-3 text-sm font-bold text-white flex-wrap">
              {/* Difficulty Badge */}
              <span className="px-3 py-1.5 bg-yellow-400 text-slate-900 rounded-md font-bold shadow-sm">
                {difficultyLabel}
              </span>

              {/* VIP Badge */}
              {movie.is_vip && (
                <span className="px-3 py-1.5 bg-purple-500 text-white rounded-md font-bold shadow-sm">
                  VIP
                </span>
              )}

              {/* IMDb Rating */}
              {movie.vote_average && (
                <div className="flex items-center border border-yellow-400 rounded px-2 py-0.5 gap-1.5 bg-black/20 backdrop-blur-sm">
                  <span className="text-yellow-400 font-black">IMDb</span>
                  <span>{movie.vote_average.toFixed(1)}</span>
                </div>
              )}

              {/* Year */}
              <span className="border border-white/30 px-2 py-0.5 rounded bg-black/20 backdrop-blur-sm">
                {movie.release_date ? new Date(movie.release_date).getFullYear() : new Date(movie.created_at).getFullYear()}
              </span>

              {/* Duration */}
              {movie.runtime && (
                <span className="border border-white/30 px-2 py-0.5 rounded bg-black/20 backdrop-blur-sm">
                  {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                </span>
              )}
            </div>

            {/* Genres */}
            {movie.genres && (
              <div className="flex flex-wrap gap-2">
                {movie.genres.split(',').map((genre) => (
                  <span
                    key={genre.trim()}
                    className="px-3 py-1.5 bg-transparent text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors cursor-pointer border border-white/5"
                  >
                    {genre.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight mb-4">
                {movie.title_vi || movie.title}
              </h1>

              {/* Sub Title */}
              {movie.title_vi && (
                <h2 className="text-xl md:text-2xl font-bold text-slate-400 mb-4">
                  {movie.title}
                </h2>
              )}

              <p className="text-slate-300 text-base leading-relaxed max-w-2xl line-clamp-3 font-medium drop-shadow-sm">
                {movie.overview || 'Khám phá bộ phim tuyệt vời này và học tiếng Anh qua phim một cách hiệu quả.'}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-6 flex items-center gap-6">
              <Link href={`/movie/${movie.id}/watch`}>
                <button className="group relative w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg shadow-yellow-400/20 transition-all hover:scale-110 hover:shadow-yellow-400/40 cursor-pointer">
                  <Play className="w-8 h-8 fill-slate-900 text-slate-900 ml-1 transition-transform group-hover:scale-110" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Related Movies Section */}
      <div className="container mx-auto px-4 py-12 space-y-16">
        <MovieRow
          title={`Phim Cùng Cấp Độ ${difficultyLabel}`}
          movies={relatedMovies}
        />
      </div>

      <Footer />
    </main>
  );
}

