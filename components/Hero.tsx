import Link from "next/link";
import { Play, Info, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from '@/lib/supabase-server';

export async function Hero() {
  const supabase = await createClient();

  // Fetch the latest movie
  const { data: latestMovie } = await supabase
    .from('movies')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Fallback data if no movie found
  const movie = latestMovie || {
    id: 'default',
    title: 'CONAN',
    title_vi: 'Thám Tử Lừng Danh Conan',
    overview: 'Thám tử lừng danh Conan phải đối mặt với vụ án khó khăn nhất từ trước đến nay. Một bí ẩn bao trùm lên toàn bộ thành phố Tokyo khi tổ chức áo đen bắt đầu hành động trở lại.',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2525&auto=format&fit=crop',
    background_image: null,
    vote_average: 8.5,
    release_date: '2024-07-15',
    runtime: 112
  };

  return (
    <div className="relative h-[85vh] w-full overflow-hidden bg-slate-900">
      {/* Background Image Area */}
      <div className="absolute inset-0 w-full h-full">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${movie.background_image || movie.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2525&auto=format&fit=crop'}')`,
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
              <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
            </div>

            {/* Age Rating */}
            <span className="bg-white text-black px-2 py-0.5 rounded font-bold">T16</span>

            {/* Year */}
            <span className="border border-white/30 px-2 py-0.5 rounded bg-black/20 backdrop-blur-sm">
              {movie.release_date ? new Date(movie.release_date).getFullYear() : 2025}
            </span>

            {/* Duration */}
            {movie.runtime && (
              <span className="border border-white/30 px-2 py-0.5 rounded bg-black/20 backdrop-blur-sm">
                {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
              </span>
            )}
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2">
            {['Chính Kịch', 'Chiếu Rạp', 'Gay Cấn', 'Hình Sự', 'Bí Ẩn', 'Phiêu Lưu'].map((genre) => (
              <span
                key={genre}
                className="px-3 py-1.5 bg-transparent text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors cursor-pointer border border-white/5"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight mb-4">
              {movie.title_vi || movie.title}
            </h1>

            <p className="text-slate-300 text-base leading-relaxed max-w-2xl line-clamp-3 font-medium drop-shadow-sm">
              {movie.overview || movie.description || 'Khám phá bộ phim tuyệt vời này và học tiếng Anh qua phim một cách hiệu quả.'}
            </p>
          </div>

          {/* Actions */}
          <div className="pt-6 flex items-center gap-6">
            <Link href={`/movie/${movie.id}`}>
              <button className="group relative w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg shadow-yellow-400/20 transition-all hover:scale-110 hover:shadow-yellow-400/40 cursor-pointer">
                <Play className="w-8 h-8 fill-slate-900 text-slate-900 ml-1 transition-transform group-hover:scale-110" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

