"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Zap, X, Check, Info } from "lucide-react";
import Link from "next/link";

interface MoviePreview {
  tmdb_id: number;
  title: string;
  title_vi: string;
  overview: string;
  poster: string;
  background_image: string;
  release_date: string;
  runtime: number;
  vote_average: number;
  genres: string;
  video_url: string;
  is_vip: boolean;
  difficulty_level: "beginner" | "intermediate" | "advanced";
}

export default function NewMoviePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const [tmdbIdInput, setTmdbIdInput] = useState("");
  const [isCrawling, setIsCrawling] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<MoviePreview | null>(null);

  const [formData, setFormData] = useState({
    tmdb_id: "",
    title: "",
    title_vi: "",
    overview: "",
    poster: "",
    background_image: "",
    release_date: "",
    runtime: "",
    vote_average: "",
    genres: "",
    video_url: "",
    is_vip: false,
    difficulty_level: "intermediate" as "beginner" | "intermediate" | "advanced",
  });

  const [subtitleEnUrl, setSubtitleEnUrl] = useState("");
  const [subtitleViUrl, setSubtitleViUrl] = useState("");

  const handleCrawl = async () => {
    if (!tmdbIdInput) {
      alert("Vui lòng nhập TMDB ID");
      return;
    }

    setIsCrawling(true);
    try {
      const res = await fetch("/api/admin/movies/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId: tmdbIdInput }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Crawl failed");

      setPreviewData(data.movie);
      setShowPreview(true);
    } catch (error: any) {
      console.error("Crawl error:", error);
      alert(`Lỗi khi crawl: ${error.message}`);
    } finally {
      setIsCrawling(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!previewData) return;

    setLoading(true);
    try {
      const movieData = {
        ...previewData,
      };

      const { data: movie, error: movieError } = await supabase
        .from("movies")
        .upsert(movieData, { onConflict: 'tmdb_id' })
        .select()
        .single();

      if (movieError) throw movieError;

      setFormData({
        tmdb_id: movie.tmdb_id.toString(),
        title: movie.title || "",
        title_vi: movie.title_vi || "",
        overview: movie.overview || "",
        poster: movie.poster || "",
        background_image: movie.background_image || "",
        release_date: movie.release_date || "",
        runtime: movie.runtime?.toString() || "",
        vote_average: movie.vote_average?.toString() || "",
        genres: movie.genres || "",
        video_url: movie.video_url || "",
        is_vip: movie.is_vip || false,
        difficulty_level: movie.difficulty_level || "intermediate",
      });

      setShowPreview(false);
      alert("Đã import phim vào cơ sở dữ liệu thành công! Bạn có thể bổ sung thêm phụ đề hoặc video URL bên dưới.");
    } catch (error: any) {
      console.error("Import error:", error);
      alert(`Lỗi khi import: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data
      const movieData = {
        ...formData,
        tmdb_id: formData.tmdb_id ? parseInt(formData.tmdb_id) : null,
        runtime: formData.runtime ? parseInt(formData.runtime) : null,
        vote_average: formData.vote_average ? parseFloat(formData.vote_average) : null,
      };

      // Upsert movie
      const { data: movie, error: movieError } = await supabase
        .from("movies")
        .upsert(movieData, { onConflict: 'tmdb_id' })
        .select()
        .single();

      if (movieError) throw movieError;

      // Insert subtitles if URLs are provided
      const subtitles = [];
      if (subtitleEnUrl) {
        subtitles.push({
          movie_id: movie.id,
          language: "en",
          url: subtitleEnUrl,
        });
      }
      if (subtitleViUrl) {
        subtitles.push({
          movie_id: movie.id,
          language: "vi",
          url: subtitleViUrl,
        });
      }

      if (subtitles.length > 0) {
        // Delete existing subtitles first to avoid duplicates
        await supabase.from("subtitles").delete().eq("movie_id", movie.id);

        const { error: subtitleError } = await supabase
          .from("subtitles")
          .insert(subtitles);

        if (subtitleError) throw subtitleError;
      }

      alert("Đã lưu phim thành công!");
      router.push("/admin/movies");
    } catch (error: any) {
      console.error("Error saving movie:", error);
      alert(`Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/movies">
              <Button variant="ghost" size="icon" className="text-white hover:bg-zinc-800">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-black tracking-tight">Thêm Phim Mới</h1>
              <p className="text-gray-400 mt-1">Sử dụng TMDB ID để tự động lấy thông tin</p>
            </div>
          </div>
        </div>

        {/* Quick Crawl Section */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-8 backdrop-blur-sm">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            Nhập TMDB ID để Crawl
          </h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={tmdbIdInput}
              onChange={(e) => setTmdbIdInput(e.target.value)}
              className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:outline-none focus:border-yellow-500 transition-all font-medium"
              placeholder="Ví dụ: 1084242"
            />
            <Button
              onClick={handleCrawl}
              disabled={isCrawling || !tmdbIdInput}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-6 rounded-xl transition-all shadow-lg shadow-yellow-500/10"
            >
              {isCrawling ? "Đang lấy dữ liệu..." : "Crawl Thông Tin"}
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 space-y-6">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-yellow-500 rounded-full" />
              Thông Tin Cơ Bản
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                  Tên phim (Gốc/Anh) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl focus:outline-none focus:border-yellow-500 transition-all"
                  placeholder="The Godfather"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                  Tên phim (Việt)
                </label>
                <input
                  type="text"
                  value={formData.title_vi}
                  onChange={(e) =>
                    setFormData({ ...formData, title_vi: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl focus:outline-none focus:border-yellow-500 transition-all"
                  placeholder="Bố Già"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">TMDB ID</label>
                <input
                  type="number"
                  value={formData.tmdb_id}
                  onChange={(e) =>
                    setFormData({ ...formData, tmdb_id: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl focus:outline-none focus:border-yellow-500 transition-all"
                  placeholder="238"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Thể loại</label>
                <input
                  type="text"
                  value={formData.genres}
                  onChange={(e) =>
                    setFormData({ ...formData, genres: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl focus:outline-none focus:border-yellow-500 transition-all"
                  placeholder="Crime, Drama"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Mô tả (Overview)</label>
              <textarea
                value={formData.overview}
                onChange={(e) =>
                  setFormData({ ...formData, overview: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl focus:outline-none focus:border-yellow-500 transition-all"
                placeholder="Mô tả nội dung phim..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Độ khó</label>
                <select
                  value={formData.difficulty_level}
                  onChange={(e) =>
                    setFormData({ ...formData, difficulty_level: e.target.value as any })
                  }
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl focus:outline-none focus:border-yellow-500 transition-all"
                >
                  <option value="beginner">Dễ (Beginner)</option>
                  <option value="intermediate">Trung bình (Intermediate)</option>
                  <option value="advanced">Khó (Advanced)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Ngày phát hành</label>
                <input
                  type="date"
                  value={formData.release_date}
                  onChange={(e) =>
                    setFormData({ ...formData, release_date: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl focus:outline-none focus:border-yellow-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Thời lượng (phút)</label>
                <input
                  type="number"
                  value={formData.runtime}
                  onChange={(e) =>
                    setFormData({ ...formData, runtime: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl focus:outline-none focus:border-yellow-500 transition-all"
                  placeholder="175"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Điểm đánh giá (0-10)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.vote_average}
                  onChange={(e) =>
                    setFormData({ ...formData, vote_average: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl focus:outline-none focus:border-yellow-500 transition-all"
                  placeholder="8.7"
                />
              </div>
            </div>
          </div>

          {/* Media URLs */}
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 space-y-6">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-yellow-500 rounded-full" />
              Hình Ảnh & Video
            </h2>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">URL Poster</label>
              <input
                type="url"
                value={formData.poster}
                onChange={(e) =>
                  setFormData({ ...formData, poster: e.target.value })
                }
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl focus:outline-none focus:border-yellow-500 transition-all"
                placeholder="https://image.tmdb.org/t/p/original/..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">URL Ảnh nền (Background)</label>
              <input
                type="url"
                value={formData.background_image}
                onChange={(e) =>
                  setFormData({ ...formData, background_image: e.target.value })
                }
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl focus:outline-none focus:border-yellow-500 transition-all"
                placeholder="https://image.tmdb.org/t/p/original/..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">URL Video (HLS)</label>
              <input
                type="url"
                value={formData.video_url}
                onChange={(e) =>
                  setFormData({ ...formData, video_url: e.target.value })
                }
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl focus:outline-none focus:border-yellow-500 transition-all"
                placeholder="https://example.com/video.m3u8"
              />
              <p className="text-xs text-gray-500 mt-1">URL file HLS (.m3u8) của video</p>
            </div>

            <div className="border-t border-zinc-800 pt-6 mt-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <div className="w-1.5 h-4 bg-yellow-500 rounded-full" />
                Phụ Đề
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                    URL Phụ đề tiếng Anh (EN)
                  </label>
                  <input
                    type="url"
                    value={subtitleEnUrl}
                    onChange={(e) => setSubtitleEnUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl focus:outline-none focus:border-yellow-500 transition-all"
                    placeholder="https://example.com/subtitle-en.vtt"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                    URL Phụ đề tiếng Việt (VI)
                  </label>
                  <input
                    type="url"
                    value={subtitleViUrl}
                    onChange={(e) => setSubtitleViUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl focus:outline-none focus:border-yellow-500 transition-all"
                    placeholder="https://example.com/subtitle-vi.vtt"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-yellow-500 rounded-full" />
              Cài Đặt
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-4 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.is_vip}
                    onChange={(e) =>
                      setFormData({ ...formData, is_vip: e.target.checked })
                    }
                    className="w-6 h-6 rounded-lg border-zinc-700 bg-zinc-800 text-yellow-500 focus:ring-yellow-500 transition-all"
                  />
                </div>
                <div>
                  <span className="text-base font-bold text-gray-200 group-hover:text-white transition-colors">Nội dung VIP</span>
                  <p className="text-sm text-gray-500">Chỉ người dùng VIP mới xem được phim này</p>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-6 pt-8">
            <Link href="/admin/movies">
              <Button type="button" variant="ghost" className="text-gray-400 hover:text-white px-8 py-6 rounded-xl font-bold">
                Hủy bỏ
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-12 py-6 rounded-xl transition-all shadow-xl shadow-yellow-500/20"
            >
              {loading ? (
                "Đang lưu..."
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" /> Lưu Phim
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="relative h-48 w-full">
              <img
                src={previewData.background_image}
                alt="Background"
                className="w-full h-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
              <button
                onClick={() => setShowPreview(false)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-8 flex items-end gap-6">
                <img
                  src={previewData.poster}
                  alt="Poster"
                  className="w-24 h-36 object-cover rounded-xl shadow-2xl border-2 border-zinc-800"
                />
                <div className="mb-2">
                  <h2 className="text-2xl font-black">{previewData.title_vi || previewData.title}</h2>
                  <p className="text-gray-400 font-medium">{previewData.title}</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-zinc-800/50 p-3 rounded-2xl border border-zinc-800">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">IMDb</p>
                  <p className="text-lg font-bold text-yellow-500">{previewData.vote_average?.toFixed(1) || "N/A"}</p>
                </div>
                <div className="bg-zinc-800/50 p-3 rounded-2xl border border-zinc-800">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Năm</p>
                  <p className="text-lg font-bold">{previewData.release_date?.split('-')[0] || "2025"}</p>
                </div>
                <div className="bg-zinc-800/50 p-3 rounded-2xl border border-zinc-800">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Thời lượng</p>
                  <p className="text-lg font-bold">{previewData.runtime}m</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Info className="w-3 h-3" /> Nội dung phim
                </p>
                <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">
                  {previewData.overview}
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={() => setShowPreview(false)}
                  variant="ghost"
                  className="flex-1 py-6 rounded-2xl font-bold text-gray-400 hover:text-white"
                >
                  Hủy bỏ
                </Button>
                <Button
                  onClick={handleConfirmImport}
                  disabled={loading}
                  className="flex-1 py-6 rounded-2xl font-black bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-500/20"
                >
                  {loading ? "Đang import..." : (
                    <>
                      <Check className="w-5 h-5 mr-2" /> Xác nhận & Nhập Form
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
