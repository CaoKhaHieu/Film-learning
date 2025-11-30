import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getAllMoviesByDifficulty } from '@/service/movie';
import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";

export const metadata = {
  title: 'Phim Cấp Độ Trung Cấp - Film Learning',
  description: 'Danh sách phim tiếng Anh dành cho người học trung cấp',
};

export default async function IntermediatePage() {
  // Fetch all intermediate movies from service
  const movieList = await getAllMoviesByDifficulty('intermediate');

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Phim Cấp Độ Trung Cấp
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl">
            Danh sách phim tiếng Anh dành cho người học trung cấp. Những bộ phim này có từ vựng phong phú hơn,
            tốc độ nói tự nhiên và nội dung đa dạng, giúp bạn nâng cao kỹ năng nghe hiểu tiếng Anh.
          </p>
        </div>

        {/* Movies Grid */}
        {movieList.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {movieList.map((movie) => (
              <Link
                key={movie.id}
                href={`/movie/${movie.id}`}
                className="group cursor-pointer"
              >
                <div className="relative aspect-2/3 w-full overflow-hidden rounded-lg bg-zinc-800 shadow-xl transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
                  <Image
                    src={movie.poster || "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=500&q=60"}
                    alt={movie.title}
                    fill
                    className="object-cover"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
                        <Play className="w-8 h-8 text-black fill-black ml-1" />
                      </div>
                    </div>
                  </div>

                  {/* VIP Badge */}
                  {movie.is_vip && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded">
                      VIP
                    </div>
                  )}

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-linear-to-t from-black to-transparent">
                    <h3 className="text-sm font-bold text-white line-clamp-2 mb-1">
                      {movie.title}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {new Date(movie.created_at).getFullYear()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Chưa có phim nào trong danh mục này.</p>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
