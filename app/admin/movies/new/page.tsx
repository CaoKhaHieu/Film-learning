"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewMoviePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    poster: "",
    video_url: "",
    is_vip: false,
    difficulty_level: "intermediate" as "beginner" | "intermediate" | "advanced",
  });

  const [subtitleEnUrl, setSubtitleEnUrl] = useState("");
  const [subtitleViUrl, setSubtitleViUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Insert movie
      const { data: movie, error: movieError } = await supabase
        .from("movies")
        .insert([formData])
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
        const { error: subtitleError } = await supabase
          .from("subtitles")
          .insert(subtitles);

        if (subtitleError) throw subtitleError;
      }

      alert("Đã thêm phim thành công!");
      router.push("/admin/movies");
    } catch (error: any) {
      console.error("Error creating movie:", error);
      alert(`Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-4xl font-bold">Thêm Phim Mới</h1>
            <p className="text-gray-400 mt-1">Điền thông tin phim bên dưới</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-zinc-900 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-bold mb-4 border-l-4 border-yellow-500 pl-3">
              Thông Tin Cơ Bản
            </h2>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tên phim <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-yellow-500"
                placeholder="Thám Tử Lừng Danh Conan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-yellow-500"
                placeholder="Mô tả nội dung phim..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Độ khó</label>
              <select
                value={formData.difficulty_level}
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
                value={formData.poster}
                onChange={(e) =>
                  setFormData({ ...formData, poster: e.target.value })
                }
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-yellow-500"
                placeholder="https://image.example.com/poster.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">URL hình ảnh poster của phim</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">URL Video (HLS)</label>
              <input
                type="url"
                value={formData.video_url}
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
                  <p className="text-xs text-gray-500 mt-1">URL file phụ đề tiếng Anh (.vtt hoặc .srt)</p>
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
                  <p className="text-xs text-gray-500 mt-1">URL file phụ đề tiếng Việt (.vtt hoặc .srt)</p>
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
                  checked={formData.is_vip}
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
              disabled={loading}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold"
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
    </div>
  );
}
