import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { MovieRow } from "@/components/MovieRow";
import { Top10Row } from "@/components/Top10Row";
import { Footer } from "@/components/Footer";

// Mock Data
const newActionMovies = [
  { id: "1", title: "Biệt Đội Đánh Thuê 4", image: "https://images.unsplash.com/photo-1535016120720-40c6874c3b13?auto=format&fit=crop&w=500&q=60", isNew: true, quality: "FHD", year: "2023" },
  { id: "2", title: "John Wick 4", image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=500&q=60", isNew: true, quality: "4K", year: "2023" },
  { id: "3", title: "Nhiệm Vụ Bất Khả Thi 7", image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=500&q=60", isNew: true, quality: "HD", year: "2023" },
  { id: "4", title: "Fast X", image: "https://images.unsplash.com/photo-1596727147705-54a9d6ed27e6?auto=format&fit=crop&w=500&q=60", isNew: false, quality: "FHD", year: "2023" },
  { id: "5", title: "Transformers 7", image: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=500&q=60", isNew: true, quality: "4K", year: "2023" },
  { id: "6", title: "The Creator", image: "https://images.unsplash.com/photo-1616530940355-351fabd9524b?auto=format&fit=crop&w=500&q=60", isNew: true, quality: "FHD", year: "2023" },
];

const newRomanceMovies = [
  { id: "7", title: "Past Lives", image: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=500&q=60", isNew: true, quality: "FHD", year: "2023" },
  { id: "8", title: "Elemental", image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=500&q=60", isNew: false, quality: "HD", year: "2023" },
  { id: "9", title: "No Hard Feelings", image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=500&q=60", isNew: true, quality: "FHD", year: "2023" },
  { id: "10", title: "Barbie", image: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=500&q=60", isNew: true, quality: "4K", year: "2023" },
  { id: "11", title: "Red, White & Royal Blue", image: "https://images.unsplash.com/photo-1535016120720-40c6874c3b13?auto=format&fit=crop&w=500&q=60", isNew: false, quality: "FHD", year: "2023" },
];

const top10Movies = [
  { id: "t1", title: "One Piece Live Action", image: "https://images.unsplash.com/photo-1596727147705-54a9d6ed27e6?auto=format&fit=crop&w=500&q=60", rank: 1 },
  { id: "t2", title: "Moving", image: "https://images.unsplash.com/photo-1616530940355-351fabd9524b?auto=format&fit=crop&w=500&q=60", rank: 2 },
  { id: "t3", title: "Loki Season 2", image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=500&q=60", rank: 3 },
  { id: "t4", title: "Gen V", image: "https://images.unsplash.com/photo-1535016120720-40c6874c3b13?auto=format&fit=crop&w=500&q=60", rank: 4 },
  { id: "t5", title: "The Continental", image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=500&q=60", rank: 5 },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white pb-20">
      <Navbar />
      <Hero />

      <div className="mt-[-100px] relative z-20 space-y-8">
        <MovieRow title="Phim Hành Động Mới" movies={newActionMovies} />
        <MovieRow title="Phim Tình Cảm Mới" movies={newRomanceMovies} />

        <div className="bg-gradient-to-r from-yellow-900/20 to-transparent py-4">
          <Top10Row title="Top 10 Phim Bộ Hôm Nay" movies={top10Movies} />
        </div>

        <MovieRow title="Phim Hài Mới" movies={newActionMovies} />
      </div>

      <Footer />
    </main>
  );
}
