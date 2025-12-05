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
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[85vh] w-full overflow-hidden bg-slate-50">
        {/* Background Image Area */}
        <div className="absolute inset-0 w-full h-full">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('${movie.background_image || movie.poster || ''}')`,
            }}
          />
          {/* Gradients for Light Theme blending */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50/90 to-transparent" />
        </div>

        {/* Content Area */}
        <div className="relative z-10 container mx-auto px-4 md:px-16 h-full flex flex-col justify-center pt-10">
          <div className="max-w-2xl space-y-6 animate-fade-in-up">
            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[1.1] mb-2">
              {movie.title_vi || movie.title}
            </h1>

            {/* Sub Title */}
            {movie.title_vi && (
              <h2 className="text-2xl md:text-3xl font-bold text-slate-400">
                {movie.title}
              </h2>
            )}

            {/* Metadata Badges */}
            <div className="flex items-center gap-4 text-sm md:text-base font-medium flex-wrap">
              <span className="px-3 py-1 bg-yellow-400 text-slate-900 rounded-md font-bold shadow-sm">
                {difficultyLabel}
              </span>
              {movie.is_vip && (
                <span className="px-3 py-1 bg-purple-500 text-white rounded-md font-bold shadow-sm">
                  VIP
                </span>
              )}
              <span className="text-slate-600 font-semibold">
                {movie.release_date ? new Date(movie.release_date).getFullYear() : new Date(movie.created_at).getFullYear()}
              </span>
              {movie.runtime && (
                <span className="text-slate-600 font-semibold">
                  {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                </span>
              )}
              {movie.vote_average && (
                <span className="text-green-600 font-black">
                  {movie.vote_average.toFixed(1)}
                </span>
              )}
            </div>

            {/* Genres */}
            {movie.genres && (
              <div className="text-slate-500 font-medium">
                {movie.genres}
              </div>
            )}

            {/* Description */}
            <p className="text-slate-600 text-lg leading-relaxed max-w-xl line-clamp-3 font-medium">
              {movie.overview || movie.description || 'Khám phá bộ phim tuyệt vời này và học tiếng Anh qua phim một cách hiệu quả.'}
            </p>

            {/* Actions */}
            <div className="pt-4 flex items-center gap-4">
              <Link href={`/movie/${movie.id}/watch`}>
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold h-14 px-8 text-lg rounded-xl shadow-lg shadow-yellow-400/20 transition-all hover:scale-105 hover:-translate-y-1">
                  <Play className="mr-2 h-6 w-6 fill-slate-900" /> Xem Phim
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Related Movies Section */}
      {relatedMovies.length > 0 && (
        <div className="py-8">
          <MovieRow
            title={`Phim Cùng Cấp Độ ${difficultyLabel}`}
            movies={relatedMovies}
          />
        </div>
      )}

      <Footer />
    </main>
  );
}

