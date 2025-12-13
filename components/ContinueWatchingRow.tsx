
import { Play, Clock } from "lucide-react";
import { MovieCard } from "./MovieCard";
import { createClient } from "@/lib/supabase-server";
import Link from "next/link";

interface WatchingMovie {
  movie_id: string;
  watched_time: number;
  duration: number;
  updated_at: string;
  movies: {
    id: string;
    title: string;
    title_vi: string | null;
    poster: string | null;
    background_image: string | null;
    is_vip: boolean;
  };
}

export async function ContinueWatchingRow() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("watch_progress")
    .select(`
movie_id,
  watched_time,
  duration,
  updated_at,
  movies(
    id,
    title,
    title_vi,
    poster,
    background_image,
    is_vip
  )
    `)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(5);

  const movies = data ? (data.filter(item => item.movies) as unknown as WatchingMovie[]) : [];

  if (movies.length === 0) return null;

  return (
    <div className="py-6 md:py-8 px-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Clock className="w-6 h-6 text-yellow-500" />
          Tiếp Tục Xem
        </h2>
        <Link
          href="/continue-watching"
          className="text-sm font-bold text-slate-500 hover:text-yellow-600 transition-colors"
        >
          Xem tất cả
        </Link>
      </div>

      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {movies.map((item: WatchingMovie) => {
            const movie = item.movies;
            const progressPercent = item.duration > 0
              ? Math.min(100, Math.max(0, (item.watched_time / item.duration) * 100))
              : 0;

            return (
              <div key={movie.id} className="snap-start shrink-0">
                <MovieCard
                  id={movie.id}
                  title={movie.title}
                  title_vi={movie.title_vi}
                  image={movie.background_image || movie.poster || "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=500&q=60"}
                  progress={progressPercent}
                  className="w-[260px] md:w-[300px]"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
