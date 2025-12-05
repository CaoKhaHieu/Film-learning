import Link from "next/link";
import { PlayCircle } from "lucide-react";

interface MovieCardProps {
  id: string;
  title: string;
  title_vi?: string | null;
  image: string;
  category?: string;
  year?: string;
  isNew?: boolean;
  quality?: string;
}

export function MovieCard({ id, title, title_vi, image, category, year, isNew, quality }: MovieCardProps) {
  return (
    <Link href={`/movie/${id}`}>
      <div className="group relative flex-shrink-0 w-[160px] md:w-[240px] cursor-pointer transition-transform duration-300 hover:scale-105 hover:z-10">
        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-zinc-800">
          <img
            src={image}
            alt={title}
            className="object-cover transition-opacity duration-300 group-hover:opacity-80 w-full h-full"
          />

          {/* Overlays */}
          {isNew && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider shadow-md">
              Mới
            </div>
          )}

          {quality && (
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm border border-white/20">
              {quality}
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <PlayCircle className="w-12 h-12 text-white fill-white/20 drop-shadow-lg" />
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="mt-2 px-1">
          <h3 className="text-sm md:text-base font-medium text-white truncate group-hover:text-yellow-500 transition-colors">
            {title_vi || title}
          </h3>
          {title_vi && (
            <p className="text-xs text-gray-400 truncate">{title}</p>
          )}
          <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
            <span>{category || "Hành động"}</span>
            <span>{year || "2024"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
