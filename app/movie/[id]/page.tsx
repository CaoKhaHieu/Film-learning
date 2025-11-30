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
    <main className="min-h-screen bg-[#0f0f0f] text-white">
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

            <p className="text-gray-200 text-base md:text-lg line-clamp-3 md:line-clamp-none max-w-2xl leading-relaxed">
              {movie.description}
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
      <Footer />
    </main>
  );
}
