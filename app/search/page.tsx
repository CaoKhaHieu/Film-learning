"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Play, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Movie {
  id: string;
  title: string;
  title_vi: string | null;
  overview: string | null;
  poster: string | null;
  difficulty_level: string | null;
  is_vip: boolean;
  created_at: string;
}

import { Suspense } from "react";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const supabase = createClient();

  // Search movies by both English and Vietnamese titles
  const searchMovies = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Search in both title (English) and title_vi (Vietnamese)
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .or(`title.ilike.%${query}%,title_vi.ilike.%${query}%`)
        .limit(50);

      if (!error && data) {
        setSearchResults(data);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  }, [supabase]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchMovies(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchMovies]);

  // Update URL when search query changes
  useEffect(() => {
    if (searchQuery) {
      const params = new URLSearchParams();
      params.set("q", searchQuery);
      router.replace(`/search?${params.toString()}`, { scroll: false });
    }
  }, [searchQuery, router]);

  const difficultyLabels: Record<string, { label: string; color: string; bg: string }> = {
    beginner: { label: "Cơ Bản", color: "text-green-700", bg: "bg-green-100 border-green-200" },
    intermediate: { label: "Trung Cấp", color: "text-blue-700", bg: "bg-blue-100 border-blue-200" },
    advanced: { label: "Nâng Cao", color: "text-red-700", bg: "bg-red-100 border-red-200" },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="shrink-0 hover:bg-slate-100 text-slate-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            {/* Search Input */}
            <div className="flex-1 flex items-center gap-3 bg-slate-100 rounded-xl px-4 py-3 border border-slate-200 focus-within:border-yellow-400 focus-within:ring-2 focus-within:ring-yellow-400/20 transition-all">
              <Search className="h-5 w-5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Tìm kiếm phim (tiếng Anh hoặc tiếng Việt)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-slate-900 placeholder-slate-400 outline-none text-base font-medium"
                autoFocus
              />
            </div>
          </div>

          {/* Search Info */}
          {searchQuery && (
            <div className="mt-3 text-sm text-slate-500 ml-14">
              {isSearching ? (
                <span>Đang tìm kiếm...</span>
              ) : (
                <span>
                  Tìm thấy <span className="text-slate-900 font-bold">{searchResults.length}</span> kết quả
                  {searchResults.length > 0 && ` cho "${searchQuery}"`}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        {!searchQuery ? (
          <div className="text-center py-20">
            <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border border-slate-100">
              <Search className="h-10 w-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Tìm kiếm phim</h2>
            <p className="text-slate-500 max-w-md mx-auto">
              Nhập tên phim bằng tiếng Anh hoặc tiếng Việt để bắt đầu hành trình học tiếng Anh qua phim
            </p>
          </div>
        ) : isSearching ? (
          <div className="text-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-yellow-400 border-r-transparent mb-4"></div>
            <p className="text-slate-500 font-medium">Đang tìm kiếm...</p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🔍</div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Không tìm thấy kết quả</h2>
            <p className="text-slate-500">
              Không tìm thấy phim nào cho từ khóa <span className="font-bold text-slate-900">"{searchQuery}"</span>
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Hãy thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {searchResults.map((movie) => {
              const difficulty = movie.difficulty_level
                ? difficultyLabels[movie.difficulty_level]
                : null;

              return (
                <Link
                  key={movie.id}
                  href={`/movie/${movie.id}`}
                  className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-yellow-400 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full"
                >
                  {/* Poster */}
                  <div className="relative aspect-[2/3] overflow-hidden bg-slate-200">
                    <img
                      src={
                        movie.poster ||
                        "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=500&q=60"
                      }
                      alt={movie.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* VIP Badge */}
                    {movie.is_vip && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 bg-purple-500 text-white text-xs font-bold rounded-lg shadow-md">
                        VIP
                      </div>
                    )}

                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <div className="w-14 h-14 rounded-full bg-yellow-400 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform shadow-lg">
                        <Play className="w-6 h-6 text-slate-900 fill-slate-900 ml-1" />
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="mb-auto">
                      <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-yellow-600 transition-colors mb-1">
                        {movie.title}
                      </h3>
                      {movie.title_vi && (
                        <p className="text-sm text-slate-500 line-clamp-1 mb-3 font-medium">
                          {movie.title_vi}
                        </p>
                      )}
                      <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                        {movie.overview || "Không có mô tả"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
                      {difficulty && (
                        <span
                          className={`px-2.5 py-1 text-xs font-bold rounded-md border ${difficulty.bg} ${difficulty.color}`}
                        >
                          {difficulty.label}
                        </span>
                      )}
                      <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded">
                        {new Date(movie.created_at).getFullYear()}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-yellow-400 border-r-transparent"></div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
