import Link from "next/link";
import { Play, Plus, Info } from "lucide-react";
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
    background_image: null
  };

  return (
    <div className="relative h-[95vh] w-full overflow-hidden bg-slate-50">
      {/* Background Image Area */}
      <div className="absolute inset-0 w-full h-full">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${movie.background_image || movie.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2525&auto=format&fit=crop'}')`,
          }}
        />
        {/* Gradients for Light Theme blending */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50/90 to-transparent" />
      </div>

      {/* Content Area */}
      <div className="relative z-10 container mx-auto px-4 md:px-16 h-full flex flex-col justify-center">
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
              Cơ Bản
            </span>
            <span className="text-slate-600 font-semibold">
              {movie.release_date ? new Date(movie.release_date).getFullYear() : 2024}
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

          {/* Description */}
          <p className="text-slate-600 text-lg leading-relaxed max-w-xl line-clamp-3 font-medium">
            {movie.overview || movie.description || 'Khám phá bộ phim tuyệt vời này và học tiếng Anh qua phim một cách hiệu quả.'}
          </p>

          {/* Actions */}
          <div className="pt-4 flex items-center gap-4">
            <Link href={`/movie/${movie.id}`}>
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold h-14 px-8 text-lg rounded-xl shadow-lg shadow-yellow-400/20 transition-all hover:scale-105 hover:-translate-y-1">
                <Play className="mr-2 h-6 w-6 fill-slate-900" /> Xem Phim
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div >
  );
}

