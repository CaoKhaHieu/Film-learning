import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MovieRow } from "@/components/MovieRow";
import { Button } from "@/components/ui/button";
import { Play, Plus, ThumbsUp, Share2, Volume2, Star, Calendar, Clock } from "lucide-react";
import Image from "next/image";

// Mock Data for the detail page
const movie = {
  id: "1",
  title: "Thám Tử Lừng Danh Conan: Tàu Ngầm Sắt Màu Đen",
  originalTitle: "Detective Conan: Black Iron Submarine",
  description: "Tại đảo Hachijo-jima, các kỹ sư từ khắp nơi trên thế giới tập trung để vận hành 'Pacific Buoy', một cơ sở ngoài khơi kết nối các camera an ninh của các lực lượng cảnh sát trên toàn thế giới. Conan và Đội thám tử nhí cũng đến đảo để xem cá voi. Tuy nhiên, Conan nhận được tin báo từ Subaru Okiya rằng một nhân viên Europol đã bị Gin sát hại ở Đức.",
  year: "2023",
  duration: "1h 50m",
  rating: "9.8",
  age: "13+",
  quality: "FHD",
  genres: ["Hoạt hình", "Trinh thám", "Hành động", "Bí ẩn"],
  cast: ["Minami Takayama", "Wakana Yamazaki", "Rikiya Koyama", "Megumi Hayashibara"],
  director: "Yuzuru Tachikawa",
  backdrop: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2525&auto=format&fit=crop",
  poster: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=500&q=60",
};

const episodes = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  title: `Tập ${i + 1}: Vụ án bí ẩn tại Tokyo ${i + 1}`,
  duration: "24m",
  image: "https://images.unsplash.com/photo-1616530940355-351fabd9524b?auto=format&fit=crop&w=500&q=60",
  description: "Conan phát hiện ra manh mối mới dẫn đến tổ chức áo đen..."
}));

const relatedMovies = [
  { id: "1", title: "Biệt Đội Đánh Thuê 4", image: "https://images.unsplash.com/photo-1535016120720-40c6874c3b13?auto=format&fit=crop&w=500&q=60", isNew: true, quality: "FHD", year: "2023" },
  { id: "2", title: "John Wick 4", image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=500&q=60", isNew: true, quality: "4K", year: "2023" },
  { id: "3", title: "Nhiệm Vụ Bất Khả Thi 7", image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=500&q=60", isNew: true, quality: "HD", year: "2023" },
  { id: "4", title: "Fast X", image: "https://images.unsplash.com/photo-1596727147705-54a9d6ed27e6?auto=format&fit=crop&w=500&q=60", isNew: false, quality: "FHD", year: "2023" },
  { id: "5", title: "Transformers 7", image: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=500&q=60", isNew: true, quality: "4K", year: "2023" },
];

export default function MovieDetailPage() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white pb-20">
      <Navbar />

      {/* Hero Section */}
      <div className="relative w-full h-[70vh] md:h-[85vh]">
        <div className="absolute inset-0">
          <Image
            src={movie.backdrop}
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

            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-300">
              <div className="flex items-center gap-1 text-green-400 font-bold">
                <Star className="w-4 h-4 fill-current" />
                {movie.rating} Match
              </div>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {movie.year}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {movie.duration}</span>
              <span className="border border-gray-500 px-2 py-0.5 rounded text-xs font-medium">{movie.quality}</span>
              <span className="border border-gray-500 px-2 py-0.5 rounded text-xs font-medium">{movie.age}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {movie.genres.map((genre) => (
                <span key={genre} className="text-sm text-gray-400 hover:text-white cursor-pointer transition-colors">
                  {genre} •
                </span>
              ))}
            </div>

            <p className="text-gray-200 text-base md:text-lg line-clamp-3 md:line-clamp-none max-w-2xl leading-relaxed">
              {movie.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link href={`/movie/${movie.id}/watch`}>
                <Button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold h-12 px-8 text-lg rounded-md">
                  <Play className="mr-2 h-5 w-5 fill-black" /> Xem Phim
                </Button>
              </Link>
              <Button variant="secondary" className="bg-gray-600/80 hover:bg-gray-600 text-white h-12 px-6 text-lg rounded-md backdrop-blur-sm">
                <Plus className="mr-2 h-5 w-5" /> Danh Sách
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full bg-gray-800/50 hover:bg-gray-700 text-white h-12 w-12 border border-gray-600">
                <ThumbsUp className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full bg-gray-800/50 hover:bg-gray-700 text-white h-12 w-12 border border-gray-600">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Episodes & Related */}
        <div className="lg:col-span-2 space-y-12">
          {/* Episodes Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="border-l-4 border-yellow-500 pl-3">Danh Sách Tập</span>
                <span className="text-gray-500 text-lg font-normal">(12 Tập)</span>
              </h3>
              <div className="flex gap-2">
                <Button variant="ghost" className="text-gray-400 hover:text-white">Mùa 1</Button>
                <Button variant="ghost" className="text-gray-400 hover:text-white">Mùa 2</Button>
              </div>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
              {episodes.map((ep) => (
                <div key={ep.id} className="group flex gap-4 p-4 rounded-lg bg-zinc-900/50 hover:bg-zinc-800 transition-colors cursor-pointer border border-transparent hover:border-zinc-700">
                  <div className="relative w-40 h-24 flex-shrink-0 rounded overflow-hidden">
                    <Image src={ep.image} alt={ep.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <h4 className="text-white font-medium group-hover:text-yellow-500 transition-colors">{ep.title}</h4>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{ep.description}</p>
                    <span className="text-xs text-gray-500 mt-2">{ep.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Related Movies */}
          <section>
            <MovieRow title="Có Thể Bạn Sẽ Thích" movies={relatedMovies} />
          </section>
        </div>

        {/* Right Column: Info & Cast */}
        <div className="space-y-8">
          <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
            <h3 className="text-xl font-bold text-white mb-4 border-l-4 border-yellow-500 pl-3">Thông Tin</h3>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-gray-500 block mb-1">Tên gốc</span>
                <span className="text-white">{movie.originalTitle}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Đạo diễn</span>
                <span className="text-white hover:text-yellow-500 cursor-pointer">{movie.director}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Quốc gia</span>
                <span className="text-white">Nhật Bản</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Khởi chiếu</span>
                <span className="text-white">20/07/2023</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
            <h3 className="text-xl font-bold text-white mb-4 border-l-4 border-yellow-500 pl-3">Diễn Viên</h3>
            <div className="space-y-3">
              {movie.cast.map((actor, i) => (
                <div key={i} className="flex items-center gap-3 group cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-gray-400">
                    {actor.charAt(0)}
                  </div>
                  <span className="text-gray-300 group-hover:text-yellow-500 transition-colors text-sm">{actor}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
