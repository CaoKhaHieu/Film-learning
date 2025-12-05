import { ChevronRight } from "lucide-react";
import { MovieCard } from "./MovieCard";

interface Movie {
  id: string;
  title: string;
  title_vi?: string | null;
  image: string;
  category?: string;
  year?: string;
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
        <div className="flex items-center gap-3">
          <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-yellow-400 to-orange-500 shadow-sm" />
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight group cursor-pointer flex items-center gap-2">
            {title}
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 transition-all group-hover:translate-x-1" />
          </h2>
        </div>
        <a href="#" className="hidden md:flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-100">
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
