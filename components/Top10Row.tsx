import Link from "next/link";

interface Movie {
  id: string;
  title: string;
  title_vi?: string | null;
  image: string;
  rank: number;
}

interface Top10RowProps {
  title: string;
  movies: Movie[];
}

export function Top10Row({ title, movies }: Top10RowProps) {
  return (
    <div className="py-8 px-4 space-y-6">
      <h2 className="text-xl md:text-2xl font-bold text-slate-900 border-l-4 border-yellow-500 pl-3">
        {title}
      </h2>

      <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x justify-center md:justify-start">
        {movies.map((movie, index) => (
          <Link href={`/movie/${movie.id}`} key={movie.id} className="relative shrink-0 w-40 md:w-[220px] snap-start group cursor-pointer">
            {/* Rank Number */}
            <div className="absolute -left-4 -bottom-4 z-10 text-[8rem] font-black text-transparent leading-none"
              style={{
                WebkitTextStroke: "2px #94a3b8",
                fontFamily: "Impact, sans-serif"
              }}>
              {index + 1}
            </div>
            <div className="absolute -left-4 -bottom-4 z-20 text-[8rem] font-black text-slate-900 leading-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ fontFamily: "Impact, sans-serif" }}>
              {index + 1}
            </div>

            <div className="relative aspect-2/3 w-full overflow-hidden rounded-lg bg-slate-200 ml-4 shadow-xl transform transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-2">
              <img
                src={movie.image}
                alt={movie.title}
                className="object-cover h-full w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 pt-6">
                <h3 className="text-sm font-bold text-white text-center truncate">{movie.title_vi || movie.title}</h3>
                {movie.title_vi && (
                  <p className="text-[10px] text-gray-300 text-center truncate">{movie.title}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
