"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, Play } from "lucide-react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";

interface Movie {
  id: string;
  title: string;
  description: string | null;
  poster: string | null;
  difficulty_level: string | null;
  is_vip: boolean;
  created_at: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const supabase = createClient();

  // Search movies
  const searchMovies = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .ilike("title", `%${query}%`)
        .limit(10);

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

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const difficultyLabels: Record<string, { label: string; color: string }> = {
    beginner: { label: "Cơ Bản", color: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" },
    intermediate: { label: "Trung Cấp", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    advanced: { label: "Nâng Cao", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  };

  return (
    <div className="fixed inset-0 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl bg-zinc-900 rounded-lg shadow-2xl border border-zinc-700 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-zinc-700">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm phim..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-lg"
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="p-1 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </Button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {isSearching ? (
            <div className="p-8 text-center text-gray-400">
              Đang tìm kiếm...
            </div>
          ) : searchQuery && searchResults.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              Không tìm thấy phim nào
            </div>
          ) : searchResults.length > 0 ? (
            <div className="p-2">
              {searchResults.map((movie) => {
                const difficulty = movie.difficulty_level
                  ? difficultyLabels[movie.difficulty_level]
                  : null;

                return (
                  <Link
                    key={movie.id}
                    href={`/movie/${movie.id}`}
                    onClick={onClose}
                    className="flex items-center gap-4 p-3 hover:bg-zinc-800 rounded-lg transition-colors group"
                  >
                    {/* Poster */}
                    <div className="relative w-16 h-24 flex-shrink-0 rounded overflow-hidden bg-zinc-800">
                      <Image
                        src={
                          movie.poster ||
                          "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=500&q=60"
                        }
                        alt={movie.title}
                        fill
                        className="object-cover"
                      />
                      {movie.is_vip && (
                        <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-purple-500 text-white text-[10px] font-bold rounded">
                          VIP
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold group-hover:text-yellow-500 transition-colors line-clamp-1">
                        {movie.title}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-2 mt-1">
                        {movie.description || "Không có mô tả"}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {difficulty && (
                          <span
                            className={`px-2 py-0.5 text-xs font-semibold rounded border ${difficulty.color}`}
                          >
                            {difficulty.label}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(movie.created_at).getFullYear()}
                        </span>
                      </div>
                    </div>

                    {/* Play Icon */}
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
                        <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400">
              Nhập tên phim để tìm kiếm
            </div>
          )}
        </div>

        {/* Footer hint */}
        {searchResults.length > 0 && (
          <div className="p-3 border-t border-zinc-700 bg-zinc-800/50">
            <p className="text-xs text-gray-400 text-center">
              Nhấn <kbd className="px-2 py-0.5 bg-zinc-700 rounded text-gray-300">ESC</kbd> để đóng
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
