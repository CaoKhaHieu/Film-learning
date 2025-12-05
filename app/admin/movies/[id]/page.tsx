"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

type Movie = {
  id: string;
  tmdb_id: number | null;
  title: string;
  title_vi: string | null;
  overview: string | null;
  description: string | null;
  poster: string | null;
  background_image: string | null;
  release_date: string | null;
  runtime: number | null;
  vote_average: number | null;
  genres: string | null;
  video_url: string | null;
  is_vip: boolean;
  difficulty_level: string | null;
  created_at: string;
};

export default function EditMoviePage() {
  const router = useRouter();
  const params = useParams();
  const movieId = params.id as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<Movie>>({});
  const [subtitleEnUrl, setSubtitleEnUrl] = useState("");
  const [subtitleViUrl, setSubtitleViUrl] = useState("");

  useEffect(() => {
    fetchMovie();
  }, [movieId]);

  const fetchMovie = async () => {
    if (!movieId) return;

    try {
      const { data: movie, error: movieError } = await supabase
        .from("movies")
        .select("*")
        .eq("id", movieId)
        .single();

      if (movieError) {
        console.error("Supabase movie fetch error:", movieError);
        throw new Error(`Lỗi tải thông tin phim: ${movieError.message}`);
      }

      if (!movie) {
        throw new Error("Không tìm thấy phim (data is null)");
      }

      setFormData(movie);

      // Fetch subtitles (Non-blocking)
      const { data: subtitles, error: subtitlesError } = await supabase
        .from("subtitles")
        .select("*")
        .eq("movie_id", movieId);

      if (subtitlesError) {
        console.warn("Error fetching subtitles (ignoring):", subtitlesError);
      } else {
        // Set subtitle URLs
        const enSubtitle = subtitles?.find((s) => s.language === "en");
        const viSubtitle = subtitles?.find((s) => s.language === "vi");

        if (enSubtitle) setSubtitleEnUrl(enSubtitle.url || "");
        if (viSubtitle) setSubtitleViUrl(viSubtitle.url || "");
      }
    } catch (error: any) {
      console.error("Error fetching movie:", error);
      alert(error.message || "Đã có lỗi xảy ra khi tải phim!");
      // router.push("/admin/movies"); // Comment out to debug
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Update movie - Only update video_url as requested
      const { error: movieError } = await supabase
        .from("movies")
        .update({
          video_url: formData.video_url
        })
        .eq("id", movieId);

      if (movieError) throw movieError;

      // Update subtitles - delete old ones and insert new ones
      await supabase.from("subtitles").delete().eq("movie_id", movieId);

      const subtitles = [];
      if (subtitleEnUrl) {
        subtitles.push({
          movie_id: movieId,
          language: "en",
          url: subtitleEnUrl,
        });
      }
      if (subtitleViUrl) {
        subtitles.push({
          movie_id: movieId,
          language: "vi",
          url: subtitleViUrl,
        });
      }

      if (subtitles.length > 0) {
        const { error: subtitleError } = await supabase
          .from("subtitles")
          .insert(subtitles);

        if (subtitleError) throw subtitleError;
      }

      alert("Đã cập nhật phim thành công!");
      router.push("/admin/movies");
    } catch (error: any) {
      console.error("Error updating movie:", error);
      alert(`Lỗi: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-white text-xl">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/movies">
            <Button variant="ghost" size="icon" className="text-white hover:bg-zinc-800">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold">Chỉnh Sửa Phim</h1>
            <p className="text-gray-400 mt-1">{formData.title_vi || formData.title}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-zinc-900 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-bold mb-4 border-l-4 border-yellow-500 pl-3">
              Thông Tin Cơ Bản
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tên phim (Gốc/Anh) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tên phim (Việt)
                </label>
                <input
                  type="text"
                  value={formData.title_vi || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, title_vi: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-yellow-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">TMDB ID</label>
                <input
                  type="number"
                  value={formData.tmdb_id || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, tmdb_id: e.target.value ? parseInt(e.target.value) : null })
                  }
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Thể loại</label>
                <input
                  type="text"
                  value={formData.genres || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, genres: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-yellow-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mô tả (Overview)</label>
              <textarea
                value={formData.overview || formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, overview: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-yellow-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Độ khó</label>
                <select
                  value={formData.difficulty_level || "intermediate"}
                  onChange={(e) =>
                    setFormData({ ...formData, difficulty_level: e.target.value as any })
                  }
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-yellow-500"
                >
                  <option value="beginner">Dễ (Beginner)</option>
                  <option value="intermediate">Trung bình (Intermediate)</option>
                  <option value="advanced">Khó (Advanced)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ngày phát hành</label>
                <input
                  type="date"
                  value={formData.release_date || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, release_date: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-yellow-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Thời lượng (phút)</label>
                <input
                  type="number"
                  value={formData.runtime || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, runtime: e.target.value ? parseInt(e.target.value) : null })
                  }
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Điểm đánh giá (0-10)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.vote_average || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, vote_average: e.target.value ? parseFloat(e.target.value) : null })
                  }
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-yellow-500"
                />
              </div>
            </div>
          </div>

          {/* Media URLs */}
          <div className="bg-zinc-900 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-bold mb-4 border-l-4 border-yellow-500 pl-3">
              Hình Ảnh & Video
            </h2>

            <div>
              <label className="block text-sm font-medium mb-2">URL Poster</label>
              <input
                type="url"
                value={formData.poster || ""}
                onChange={(e) =>
                  setFormData({ ...formData, poster: e.target.value })
                }
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-yellow-500"
                placeholder="https://image.tmdb.org/t/p/original/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">URL Ảnh nền (Background)</label>
              <input
                type="url"
                value={formData.background_image || ""}
                onChange={(e) =>
                  setFormData({ ...formData, background_image: e.target.value })
                }
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-yellow-500"
                placeholder="https://image.tmdb.org/t/p/original/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">URL Video (HLS)</label>
              <input
                type="url"
                value={formData.video_url || ""}
                onChange={(e) =>
                  setFormData({ ...formData, video_url: e.target.value })
                }
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-yellow-500"
                placeholder="https://example.com/video.m3u8"
              />
              <p className="text-xs text-gray-500 mt-1">URL file HLS (.m3u8) của video</p>
            </div>

            <div className="border-t border-zinc-700 pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-3">Phụ Đề</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    URL Phụ đề tiếng Anh (EN)
                  </label>
                  <input
                    type="url"
                    value={subtitleEnUrl}
                    onChange={(e) => setSubtitleEnUrl(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-yellow-500"
                    placeholder="https://example.com/subtitle-en.vtt"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    URL Phụ đề tiếng Việt (VI)
                  </label>
                  <input
                    type="url"
                    value={subtitleViUrl}
                    onChange={(e) => setSubtitleViUrl(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-yellow-500"
                    placeholder="https://example.com/subtitle-vi.vtt"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-zinc-900 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-bold mb-4 border-l-4 border-yellow-500 pl-3">
              Cài Đặt
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_vip || false}
                  onChange={(e) =>
                    setFormData({ ...formData, is_vip: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-yellow-500 focus:ring-yellow-500"
                />
                <div>
                  <span className="text-sm font-medium">Nội dung VIP</span>
                  <p className="text-xs text-gray-400">Chỉ người dùng VIP mới xem được</p>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link href="/admin/movies">
              <Button type="button" variant="ghost" className="text-gray-400 hover:text-white">
                Hủy
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={saving}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold"
            >
              {saving ? (
                "Đang lưu..."
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" /> Cập Nhật
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
