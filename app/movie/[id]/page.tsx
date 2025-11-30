import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MovieRow } from "@/components/MovieRow";
import { Button } from "@/components/ui/button";
import { Play, Plus, ThumbsUp, Share2, Volume2, Star, Calendar, Clock } from "lucide-react";
import Image from "next/image";
import { createClient, type Movie } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';


export default async function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  // Fetch movie details
  const { data: movie, error } = await supabase
    .from('movies')
    .select('*')
    .eq('id', id)
    .single();

  // If movie not found, show 404
  if (error || !movie) {
    notFound();
  }

  // Fetch related movies (same difficulty level, exclude current movie)
  const { data: relatedMoviesData } = await supabase
    .from('movies')
    .select('*')
    .eq('difficulty_level', movie.difficulty_level)
    .neq('id', id)
    .limit(10);

  // Transform related movies for MovieRow component
  const relatedMovies = (relatedMoviesData || []).map((m: Movie) => ({
    id: m.id,
    title: m.title,
    image: m.poster || "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=500&q=60",
    isNew: false,
    quality: m.is_vip ? "VIP" : "HD",
    year: new Date(m.created_at).getFullYear().toString(),
  }));

  // Get difficulty level label
  const difficultyLabels: Record<string, string> = {
    beginner: 'Cơ Bản',
    intermediate: 'Trung Cấp',
    advanced: 'Nâng Cao',
  };

  const difficultyLabel = movie.difficulty_level
    ? difficultyLabels[movie.difficulty_level] || movie.difficulty_level
    : 'Chưa xác định';

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <Navbar />

      {/* Hero Section */}
      <div className="relative w-full h-[70vh] md:h-[85vh]">
        <div className="absolute inset-0">
          <Image
            src={movie.poster || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2525&auto=format&fit=crop"}
            alt={movie.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f] via-[#0f0f0f]/60 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-end pb-12 md:pb-20">
          <div className="max-w-4xl space-y-6">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              {movie.title}
            </h1>

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
                {new Date(movie.created_at).getFullYear()}
              </span>
            </div>

            <p className="text-gray-200 text-base md:text-lg line-clamp-3 md:line-clamp-none max-w-2xl leading-relaxed">
              {movie.description || 'Khám phá bộ phim tuyệt vời này và học tiếng Anh qua phim một cách hiệu quả.'}
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

