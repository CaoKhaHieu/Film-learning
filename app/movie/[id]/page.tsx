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
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <Navbar />

      {/* Hero Section */}
      <div className="relative w-full h-[70vh] md:h-[85vh]">
        <div className="absolute inset-0">
          <img
            src={movie.background_image || movie.poster || ''}
            alt={movie.title}
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#0f0f0f] via-[#0f0f0f]/60 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-r from-[#0f0f0f] via-[#0f0f0f]/60 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-end pb-12 md:pb-20">
          <div className="max-w-4xl space-y-6">
            <div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-2">
                {movie.title_vi || movie.title}
              </h1>
              {movie.title_vi && (
                <h2 className="text-xl md:text-2xl font-semibold text-gray-300">
                  {movie.title}
                </h2>
              )}
            </div>

            {/* Movie Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-md font-semibold border border-yellow-500/30">
                {difficultyLabel}
              </span>
              {movie.is_vip && (
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-md font-semibold border border-purple-500/30">
                  VIP
                </span>
              )}
              <span className="text-gray-400">
                {movie.release_date ? new Date(movie.release_date).getFullYear() : new Date(movie.created_at).getFullYear()}
              </span>
              {movie.runtime && (
                <span className="text-gray-400">
                  {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                </span>
              )}
              {movie.vote_average && (
                <span className="text-green-400 font-bold">
                  {movie.vote_average.toFixed(1)}
                </span>
              )}
            </div>

            {movie.genres && (
              <div className="text-gray-400 text-sm">
                {movie.genres}
              </div>
            )}

            <p className="text-gray-200 text-base md:text-lg line-clamp-3 md:line-clamp-none max-w-2xl leading-relaxed">
              {movie.overview || movie.description || 'Khám phá bộ phim tuyệt vời này và học tiếng Anh qua phim một cách hiệu quả.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link href={`/movie/${movie.id}/watch`}>
                <Button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold h-12 px-8 text-lg rounded-md">
                  <Play className="mr-2 h-5 w-5 fill-black" /> Xem Phim
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

