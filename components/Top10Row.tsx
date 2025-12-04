import Link from "next/link";

interface Movie {
  id: string;
  title: string;
  image: string;
  rank: number;
}

interface Top10RowProps {
  title: string;
  movies: Movie[];
}

export function Top10Row({ title, movies }: Top10RowProps) {
  return (
    <div className="py-8 px-4 md:px-12 space-y-6">
      <h2 className="text-xl md:text-2xl font-bold text-white border-l-4 border-yellow-500 pl-3">
        {title}
      </h2>

      <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x justify-center md:justify-start">
        {movies.map((movie, index) => (
          <Link href={`/movie/${movie.id}`} key={movie.id} className="relative shrink-0 w-40 md:w-[220px] snap-start group cursor-pointer">
            {/* Rank Number */}
            <div className="absolute -left-4 -bottom-4 z-10 text-[8rem] font-black text-transparent leading-none"
              style={{
                WebkitTextStroke: "2px #555",
                fontFamily: "Impact, sans-serif"
              }}>
              {index + 1}
            </div>
            <div className="absolute -left-4 -bottom-4 z-20 text-[8rem] font-black text-white leading-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ fontFamily: "Impact, sans-serif" }}>
              {index + 1}
            </div>

            <div className="relative aspect-2/3 w-full overflow-hidden rounded-lg bg-zinc-800 ml-4 shadow-xl transform transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-2">
              <img
                src={movie.image}
                alt={movie.title}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-sm font-bold text-white text-center truncate">{movie.title}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
