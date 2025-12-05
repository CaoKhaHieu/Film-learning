import Link from "next/link";
import { PlayCircle } from "lucide-react";

import { cn } from "@/lib/utils";

interface MovieCardProps {
  id: string;
  title: string;
  title_vi?: string | null;
  image: string;
  category?: string;
  year?: string;
  quality?: string;
  background_image?: string;
  className?: string;
}

export function MovieCard({ id, title, title_vi, image, category, year, quality, background_image, className }: MovieCardProps) {
  return (
    <Link href={`/movie/${id}`}>
      <div className={cn(
        "group relative flex-shrink-0 cursor-pointer transition-all duration-300 hover:-translate-y-1",
        className
      )}>
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-white shadow-md group-hover:shadow-xl transition-all duration-300 ring-1 ring-slate-900/5">
          <img
            src={background_image || image}
            alt={title}
            className="object-contain transition-transform duration-500 group-hover:scale-105 w-full h-full"
          />

          {quality && (
            <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/10">
              {quality}
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-[2px]">
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
              <PlayCircle className="w-8 h-8 text-white fill-white" />
            </div>
          </div>
        </div>

        <div className="mt-3 px-1 space-y-1">
          <h3 className="text-lg md:text-xl font-bold text-slate-800 truncate group-hover:text-yellow-600 transition-colors">
            {title}
          </h3>
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            {title_vi && (
              <p className="text-xs text-slate-500 truncate font-medium">{title}</p>
            )}
            {
              year && (
                <span>{year}</span>
              )
            }
          </div>
        </div>
      </div>
    </Link>
  );
}
