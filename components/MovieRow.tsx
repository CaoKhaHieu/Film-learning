import { ChevronRight } from "lucide-react";
import { MovieCard } from "./MovieCard";

interface Movie {
  id: string;
  title: string;
  image: string;
  category?: string;
  year?: string;
  isNew?: boolean;
  quality?: string;
}

interface MovieRowProps {
  title: string;
  movies: Movie[];
}

export function MovieRow({ title, movies }: MovieRowProps) {
  return (
    <div className="py-6 md:py-8 px-4 md:px-12 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 group cursor-pointer">
          <span className="border-l-4 border-yellow-500 pl-3">{title}</span>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100" />
        </h2>
        <a href="#" className="text-xs md:text-sm text-gray-400 hover:text-yellow-500 transition-colors">
          Xem tất cả
        </a>
      </div>

      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {movies.map((movie) => (
            <div key={movie.id} className="snap-start">
              <MovieCard {...movie} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
