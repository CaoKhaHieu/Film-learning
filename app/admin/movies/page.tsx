"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search, Crown, Loader2, Film } from "lucide-react";
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
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [filterVIP, setFilterVIP] = useState<string>("all");
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
      // alert("Đã xóa phim thành công!"); // Removed alert for cleaner UX
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

      // Optimistic update
      setMovies(movies.map(m =>
        m.id === id ? { ...m, is_vip: !currentStatus } : m
      ));
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

  const getDifficultyBadge = (level: string | null) => {
    switch (level) {
      case 'beginner':
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Dễ</Badge>;
      case 'intermediate':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">Trung bình</Badge>;
      case 'advanced':
        return <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">Khó</Badge>;
      default:
        return <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200">Chưa đặt</Badge>;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-slate-50">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản Lý Phim</h1>
          <p className="text-slate-500 mt-1">
            Hiển thị: {filteredMovies.length} / Tổng: {totalCount} phim
          </p>
        </div>
        <Link href="/admin/movies/new">
          <Button className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Thêm Phim Mới
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 mb-6 border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Tìm kiếm phim (Tên Anh/Việt)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200"
          />
        </div>

        <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
          <SelectTrigger className="w-[180px] bg-slate-50 border-slate-200">
            <SelectValue placeholder="Độ khó" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả độ khó</SelectItem>
            <SelectItem value="beginner">Dễ</SelectItem>
            <SelectItem value="intermediate">Trung bình</SelectItem>
            <SelectItem value="advanced">Khó</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterVIP} onValueChange={setFilterVIP}>
          <SelectTrigger className="w-[150px] bg-slate-50 border-slate-200">
            <SelectValue placeholder="Loại phim" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
            <SelectItem value="free">Miễn phí</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Movies Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="w-[400px]">Phim</TableHead>
              <TableHead>Độ khó</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Video URL</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang tải dữ liệu...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredMovies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Film className="w-8 h-8 text-slate-300" />
                    <p>Không tìm thấy phim nào</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredMovies.map((movie) => (
                <TableRow key={movie.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-16 flex-shrink-0 rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                        {movie.poster ? (
                          <img
                            src={movie.poster}
                            alt={movie.title}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Film className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{movie.title_vi || movie.title}</div>
                        {movie.title_vi && (
                          <div className="text-xs text-slate-500">{movie.title}</div>
                        )}
                        <div className="text-xs text-slate-400 mt-0.5">ID: {movie.tmdb_id || 'N/A'}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue={movie.difficulty_level || ""}
                      onValueChange={(value) => updateDifficultyLevel(movie.id, value)}
                    >
                      <SelectTrigger className="w-[130px] h-8 text-xs bg-transparent border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Dễ</SelectItem>
                        <SelectItem value="intermediate">Trung bình</SelectItem>
                        <SelectItem value="advanced">Khó</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleVIP(movie.id, movie.is_vip)}
                      className={`h-7 px-2 text-xs font-medium border ${movie.is_vip
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                      {movie.is_vip ? (
                        <>
                          <Crown className="h-3 w-3 mr-1" /> VIP
                        </>
                      ) : (
                        "Miễn phí"
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-slate-500 max-w-[150px] truncate" title={movie.video_url || ""}>
                      {movie.video_url || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/movies/${movie.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMovie(movie.id, movie.title)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Load More Button */}
      {hasMore && !loading && filteredMovies.length > 0 && (
        <div className="mt-6 flex justify-center">
          <Button
            onClick={loadMore}
            disabled={loadingMore}
            variant="outline"
            className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700 min-w-[150px]"
          >
            {loadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải...
              </>
            ) : (
              "Tải thêm phim"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
