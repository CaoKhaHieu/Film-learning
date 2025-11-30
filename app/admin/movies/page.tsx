"use client";

import { useEffect, useState } from "react";
import { supabase, type MovieWithGenres, type Genre } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye, EyeOff, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<MovieWithGenres[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "movie" | "series">("all");
  const [filterPublished, setFilterPublished] = useState<"all" | "published" | "draft">("all");

  useEffect(() => {
    fetchMovies();
    fetchGenres();
  }, []);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("movies_with_genres")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMovies(data || []);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const { data, error } = await supabase
        .from("genres")
        .select("*")
        .order("name");

      if (error) throw error;
      setGenres(data || []);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  const deleteMovie = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc muốn xóa phim "${title}"?`)) return;

    try {
      const { error } = await supabase.from("movies").delete().eq("id", id);

      if (error) throw error;

      setMovies(movies.filter((m) => m.id !== id));
      alert("Đã xóa phim thành công!");
    } catch (error) {
      console.error("Error deleting movie:", error);
      alert("Lỗi khi xóa phim!");
    }
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("movies")
        .update({ is_published: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      fetchMovies();
    } catch (error) {
      console.error("Error toggling published status:", error);
      alert("Lỗi khi cập nhật trạng thái!");
    }
  };

  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.original_title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || movie.type === filterType;
    const matchesPublished = filterPublished === "all" ||
      (filterPublished === "published" && movie.is_published) ||
      (filterPublished === "draft" && !movie.is_published);

    return matchesSearch && matchesType && matchesPublished;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-white text-xl">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Quản Lý Phim</h1>
            <p className="text-gray-400">Tổng số: {filteredMovies.length} phim</p>
          </div>
          <Link href="/admin/movies/new">
            <Button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold">
              <Plus className="mr-2 h-5 w-5" /> Thêm Phim Mới
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-zinc-900 rounded-lg p-6 mb-6 space-y-4">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm phim..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                />
              </div>
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-yellow-500"
            >
              <option value="all">Tất cả loại</option>
              <option value="movie">Phim lẻ</option>
              <option value="series">Phim bộ</option>
            </select>

            {/* Published Filter */}
            <select
              value={filterPublished}
              onChange={(e) => setFilterPublished(e.target.value as any)}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-yellow-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="published">Đã xuất bản</option>
              <option value="draft">Bản nháp</option>
            </select>
          </div>
        </div>

        {/* Movies Table */}
        <div className="bg-zinc-900 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Phim</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Loại</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Thể loại</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Năm</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Độ khó</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredMovies.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      Không tìm thấy phim nào
                    </td>
                  </tr>
                ) : (
                  filteredMovies.map((movie) => (
                    <tr key={movie.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-24 flex-shrink-0 rounded overflow-hidden bg-zinc-800">
                            {movie.poster_url ? (
                              <Image
                                src={movie.poster_url}
                                alt={movie.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-600">
                                No Image
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{movie.title}</div>
                            {movie.original_title && (
                              <div className="text-sm text-gray-400">{movie.original_title}</div>
                            )}
                            <div className="text-xs text-gray-500 mt-1">{movie.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${movie.type === 'movie'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-purple-500/20 text-purple-400'
                          }`}>
                          {movie.type === 'movie' ? 'Phim lẻ' : 'Phim bộ'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {movie.genres?.slice(0, 2).map((genre, idx) => (
                            <span key={idx} className="px-2 py-1 bg-zinc-700 rounded text-xs">
                              {genre}
                            </span>
                          ))}
                          {movie.genres && movie.genres.length > 2 && (
                            <span className="px-2 py-1 bg-zinc-700 rounded text-xs">
                              +{movie.genres.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{movie.release_year || '-'}</td>
                      <td className="px-6 py-4">
                        {movie.difficulty_level && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${movie.difficulty_level === 'beginner'
                              ? 'bg-green-500/20 text-green-400'
                              : movie.difficulty_level === 'intermediate'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                            {movie.difficulty_level === 'beginner' ? 'Dễ' :
                              movie.difficulty_level === 'intermediate' ? 'Trung bình' : 'Khó'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => togglePublished(movie.id, movie.is_published)}
                          className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-medium transition-colors ${movie.is_published
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                            }`}
                        >
                          {movie.is_published ? (
                            <>
                              <Eye className="h-4 w-4" /> Công khai
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-4 w-4" /> Nháp
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/movies/${movie.id}`}>
                            <Button variant="ghost" size="icon" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMovie(movie.id, movie.title)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
