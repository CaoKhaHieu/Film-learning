"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, type Genre } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewMoviePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    original_title: "",
    slug: "",
    type: "movie" as "movie" | "series",
    description: "",
    poster_url: "",
    backdrop_url: "",
    trailer_url: "",
    release_year: new Date().getFullYear(),
    duration: 0,
    imdb_rating: 0,
    age_rating: "",
    country: "USA",
    language: "en",
    difficulty_level: "intermediate" as "beginner" | "intermediate" | "advanced",
    is_featured: false,
    is_published: false,
  });

  useEffect(() => {
    fetchGenres();
  }, []);

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

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

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

      // Insert movie-genre relationships
      if (selectedGenres.length > 0) {
        const movieGenres = selectedGenres.map((genreId) => ({
          movie_id: movie.id,
          genre_id: genreId,
        }));

        const { error: genreError } = await supabase
          .from("movie_genres")
          .insert(movieGenres);

        if (genreError) throw genreError;
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

  const toggleGenre = (genreId: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tên phim <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-yellow-500"
                  placeholder="Thám Tử Lừng Danh Conan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tên gốc</label>
                <input
                  type="text"
                  value={formData.original_title}
                  onChange={(e) =>
                    setFormData({ ...formData, original_title: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-yellow-500"
                  placeholder="Detective Conan"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-yellow-500"
                placeholder="tham-tu-lung-danh-conan"
              />
              <p className="text-xs text-gray-500 mt-1">URL-friendly identifier (tự động tạo từ tên phim)</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Loại</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as any })
                  }
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-yellow-500"
                >
                  <option value="movie">Phim lẻ</option>
                  <option value="series">Phim bộ</option>
                </select>
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
                value={formData.poster_url}
                onChange={(e) =>
                  setFormData({ ...formData, poster_url: e.target.value })
                }
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-yellow-500"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">URL Backdrop</label>
              <input
                type="url"
                value={formData.backdrop_url}
                onChange={(e) =>
                  setFormData({ ...formData, backdrop_url: e.target.value })
                }
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-yellow-500"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">URL Trailer</label>
              <input
                type="url"
                value={formData.trailer_url}
                onChange={(e) =>
                  setFormData({ ...formData, trailer_url: e.target.value })
                }
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-yellow-500"
                placeholder="https://youtube.com/..."
              />
            </div>
          </div>

          {/* Details */}
          <div className="bg-zinc-900 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-bold mb-4 border-l-4 border-yellow-500 pl-3">
              Chi Tiết
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Năm</label>
                <input
                  type="number"
                  value={formData.release_year}
                  onChange={(e) =>
                    setFormData({ ...formData, release_year: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Thời lượng (phút)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">IMDB Rating</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.imdb_rating}
                  onChange={(e) =>
                    setFormData({ ...formData, imdb_rating: parseFloat(e.target.value) })
                  }
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phân loại</label>
                <input
                  type="text"
                  value={formData.age_rating}
                  onChange={(e) =>
                    setFormData({ ...formData, age_rating: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-yellow-500"
                  placeholder="PG-13"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Quốc gia</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ngôn ngữ</label>
                <input
                  type="text"
                  value={formData.language}
                  onChange={(e) =>
                    setFormData({ ...formData, language: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:border-yellow-500"
                  placeholder="en"
                />
              </div>
            </div>
          </div>

          {/* Genres */}
          <div className="bg-zinc-900 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-bold mb-4 border-l-4 border-yellow-500 pl-3">
              Thể Loại
            </h2>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  type="button"
                  onClick={() => toggleGenre(genre.id)}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${selectedGenres.includes(genre.id)
                      ? "bg-yellow-500 text-black"
                      : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                    }`}
                >
                  {genre.name}
                </button>
              ))}
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
                  checked={formData.is_featured}
                  onChange={(e) =>
                    setFormData({ ...formData, is_featured: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-yellow-500 focus:ring-yellow-500"
                />
                <span className="text-sm">Phim nổi bật</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) =>
                    setFormData({ ...formData, is_published: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-yellow-500 focus:ring-yellow-500"
                />
                <span className="text-sm">Xuất bản ngay</span>
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
