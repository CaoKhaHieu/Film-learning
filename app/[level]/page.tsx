import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getAllMoviesByDifficulty } from '@/service/movie';
import { MovieListWithLoadMore } from "@/components/MovieListWithLoadMore";

const levelConfig: Record<string, { title: string; description: string }> = {
  beginner: {
    title: 'Phim Cấp Độ Cơ Bản',
    description: 'Danh sách phim tiếng Anh dành cho người mới bắt đầu. Những bộ phim này có từ vựng đơn giản, tốc độ nói chậm và nội dung dễ hiểu, phù hợp để bắt đầu hành trình học tiếng Anh qua phim.'
  },
  intermediate: {
    title: 'Phim Cấp Độ Trung Cấp',
    description: 'Danh sách phim tiếng Anh dành cho người học trung cấp. Những bộ phim này có từ vựng phong phú hơn, tốc độ nói tự nhiên và nội dung đa dạng, giúp bạn nâng cao kỹ năng nghe hiểu tiếng Anh.'
  },
  advanced: {
    title: 'Phim Cấp Độ Nâng Cao',
    description: 'Danh sách phim tiếng Anh dành cho người học nâng cao. Những bộ phim này có từ vựng chuyên sâu, tốc độ nói nhanh và nội dung phức tạp, thách thức kỹ năng nghe hiểu và mở rộng vốn từ vựng của bạn.'
  },
  all: {
    title: 'Tất Cả Phim',
    description: 'Khám phá tất cả các bộ phim tiếng Anh tại Film Learning. Từ cấp độ cơ bản đến nâng cao, chúng tôi có đầy đủ các thể loại để bạn lựa chọn và bắt đầu học tập.'
  }
};

export async function generateStaticParams() {
  return [
    { level: 'beginner' },
    { level: 'intermediate' },
    { level: 'advanced' },
    { level: 'all' },
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  const config = levelConfig[level] || levelConfig.all;

  return {
    title: `${config.title} - Film Learning`,
    description: config.description,
  };
}

export default async function LevelPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;

  const isKnownLevel = ['beginner', 'intermediate', 'advanced'].includes(level);
  const difficulty = isKnownLevel ? level : 'all';
  const config = levelConfig[difficulty];

  // Fetch initial batch of movies (20 items)
  const initialMovies = await getAllMoviesByDifficulty(difficulty, 0, 20);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <div className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            {config.title}
          </h1>
          <p className="text-slate-600 text-lg max-w-3xl leading-relaxed">
            {config.description}
          </p>
        </div>

        {/* Movies Grid with Load More */}
        <MovieListWithLoadMore
          initialMovies={initialMovies}
          difficulty={difficulty}
          itemsPerPage={20}
        />
      </div>

      <Footer />
    </main>
  );
}
