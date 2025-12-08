"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Search, Crown } from "lucide-react";
import Link from "next/link";

type Movie = {
  id: string;
  tmdb_id: number | null;
  title: string;
  title_vi: string | null;
  overview: string | null;
  description: string | null;
  poster: string | null;
  video_url: string | null;
  is_vip: boolean;
  difficulty_level: string | null;
  created_at: string;
};

export default function AdminMoviesPage() {
  const supabase = createClient();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");
  const [filterVIP, setFilterVIP] = useState<"all" | "vip" | "free">("all");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    fetchMovies(true);
  }, []);

  const fetchMovies = async (reset = false) => {
    if (reset) {
      setLoading(true);
      setPage(0);
      setMovies([]);
    } else {
      setLoadingMore(true);
    }

    try {
      const currentPage = reset ? 0 : page;
      const from = currentPage * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // Get total count
      const { count } = await supabase
        .from("movies")
        .select("*", { count: "exact", head: true });

      setTotalCount(count || 0);

      // Get paginated data
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (reset) {
        setMovies(data || []);
      } else {
        setMovies(prev => [...prev, ...(data || [])]);
      }

      setHasMore((data?.length || 0) === ITEMS_PER_PAGE);
      setPage(currentPage + 1);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchMovies(false);
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

  const toggleVIP = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("movies")
        .update({ is_vip: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      fetchMovies();
    } catch (error) {
      console.error("Error toggling VIP status:", error);
      alert("Lỗi khi cập nhật trạng thái VIP!");
    }
  };

  const updateDifficultyLevel = async (id: string, newLevel: string) => {
    try {
      const { error } = await supabase
        .from("movies")
        .update({ difficulty_level: newLevel })
        .eq("id", id);

      if (error) throw error;

      // Update local state immediately
      setMovies(movies.map(m =>
        m.id === id ? { ...m, difficulty_level: newLevel } : m
      ));
    } catch (error) {
      console.error("Error updating difficulty level:", error);
      alert("Lỗi khi cập nhật độ khó!");
    }
  };

  const filteredMovies = movies.filter((movie) => {
    const matchesSearch =
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (movie.title_vi && movie.title_vi.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDifficulty = filterDifficulty === "all" || movie.difficulty_level === filterDifficulty;
    const matchesVIP = filterVIP === "all" ||
      (filterVIP === "vip" && movie.is_vip) ||
      (filterVIP === "free" && !movie.is_vip);

    return matchesSearch && matchesDifficulty && matchesVIP;
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
            <p className="text-gray-400">
              Hiển thị: {filteredMovies.length} / Tổng: {totalCount} phim
            </p>
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
                  placeholder="Tìm kiếm phim (Tên Anh/Việt)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                />
              </div>
            </div>

            {/* Difficulty Filter */}
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value as any)}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-yellow-500"
            >
              <option value="all">Tất cả độ khó</option>
              <option value="beginner">Dễ</option>
              <option value="intermediate">Trung bình</option>
              <option value="advanced">Khó</option>
            </select>

            {/* VIP Filter */}
            <select
              value={filterVIP}
              onChange={(e) => setFilterVIP(e.target.value as any)}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-yellow-500"
            >
              <option value="all">Tất cả</option>
              <option value="vip">VIP</option>
              <option value="free">Miễn phí</option>
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
                  <th className="px-6 py-4 text-left text-sm font-semibold">Độ khó</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Video URL</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredMovies.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      Không tìm thấy phim nào
                    </td>
                  </tr>
                ) : (
                  filteredMovies.map((movie) => (
                    <tr key={movie.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-24 flex-shrink-0 rounded overflow-hidden bg-zinc-800 group">
                            {movie.poster ? (
                              <img
                                src={movie.poster}
                                alt={movie.title}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-600">
                                No Image
                              </div>
                            )}
                            {movie.tmdb_id && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-[10px] text-center text-gray-300 py-0.5">
                                ID: {movie.tmdb_id}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{movie.title_vi || movie.title}</div>
                            {movie.title_vi && (
                              <div className="text-xs text-gray-400">{movie.title}</div>
                            )}
                            {(movie.overview || movie.description) && (
                              <div className="text-sm text-gray-500 line-clamp-1 mt-1 max-w-xs">
                                {movie.overview || movie.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={movie.difficulty_level || ""}
                          onChange={(e) => updateDifficultyLevel(movie.id, e.target.value)}
                          className={`px-3 py-1.5 rounded text-xs font-medium border-2 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 ${movie.difficulty_level === 'beginner'
                              ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30 focus:ring-green-500'
                              : movie.difficulty_level === 'intermediate'
                                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30 focus:ring-yellow-500'
                                : movie.difficulty_level === 'advanced'
                                  ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30 focus:ring-red-500'
                                  : 'bg-gray-500/20 text-gray-400 border-gray-500/30 hover:bg-gray-500/30 focus:ring-gray-500'
                            }`}
                        >
                          <option value="" className="bg-zinc-800 text-white">Chưa đặt</option>
                          <option value="beginner" className="bg-zinc-800 text-white">Dễ</option>
                          <option value="intermediate" className="bg-zinc-800 text-white">Trung bình</option>
                          <option value="advanced" className="bg-zinc-800 text-white">Khó</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleVIP(movie.id, movie.is_vip)}
                          className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-medium transition-colors ${movie.is_vip
                            ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                            : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                            }`}
                        >
                          {movie.is_vip ? (
                            <>
                              <Crown className="h-4 w-4" /> VIP
                            </>
                          ) : (
                            <>
                              Miễn phí
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-400 max-w-xs truncate">
                          {movie.video_url || '-'}
                        </div>
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

        {/* Load More Button */}
        {hasMore && !loading && filteredMovies.length > 0 && (
          <div className="mt-6 flex justify-center">
            <Button
              onClick={loadMore}
              disabled={loadingMore}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8"
            >
              {loadingMore ? "Đang tải..." : "Tải thêm"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
