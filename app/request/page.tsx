"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Film, MessageSquare, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function RequestMoviePage() {
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    movie_title: "",
    note: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.movie_title.trim()) return;

    setIsLoading(true);

    try {
      // Get current user (optional)
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("movie_requests")
        .insert({
          movie_title: formData.movie_title,
          note: formData.note,
          user_id: user?.id || null
        });

      if (error) throw error;

      setIsSuccess(true);
      setFormData({ movie_title: "", note: "" });
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại sau!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="shrink-0 hover:bg-slate-100 text-slate-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-slate-900">Yêu Cầu Phim</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Intro Section */}
          <div className="text-center mb-10">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border border-slate-100">
              <Film className="h-10 w-10 text-yellow-500" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">
              Bạn muốn xem phim gì?
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              Kho phim của chúng tôi đang được cập nhật liên tục. <br className="hidden md:block" />
              Hãy cho chúng tôi biết bộ phim bạn muốn học tiếng Anh, chúng tôi sẽ ưu tiên cập nhật sớm nhất!
            </p>
          </div>

          {/* Form Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            {isSuccess ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Đã gửi yêu cầu!</h3>
                <p className="text-slate-600 mb-8">
                  Cảm ơn bạn đã đóng góp ý kiến. Chúng tôi sẽ xem xét và cập nhật phim trong thời gian sớm nhất.
                </p>
                <Button
                  onClick={() => setIsSuccess(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold"
                >
                  Gửi yêu cầu khác
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-6">
                {/* Movie Title Input */}
                <div className="space-y-2">
                  <label htmlFor="movie_title" className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
                    Tên phim <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Film className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      id="movie_title"
                      required
                      placeholder="Ví dụ: Friends, Harry Potter, The Matrix..."
                      value={formData.movie_title}
                      onChange={(e) => setFormData({ ...formData, movie_title: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none transition-all text-slate-900 placeholder-slate-400 font-medium"
                    />
                  </div>
                </div>

                {/* Note Input */}
                <div className="space-y-2">
                  <label htmlFor="note" className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
                    Ghi chú thêm (Tùy chọn)
                  </label>
                  <div className="relative">
                    <div className="absolute top-4 left-4 pointer-events-none">
                      <MessageSquare className="h-5 w-5 text-slate-400" />
                    </div>
                    <textarea
                      id="note"
                      rows={4}
                      placeholder="Bạn muốn học giọng Anh-Anh hay Anh-Mỹ? Hay bất kỳ yêu cầu đặc biệt nào khác..."
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none transition-all text-slate-900 placeholder-slate-400 font-medium resize-none"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold text-lg h-14 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                      <span>Đang gửi...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="h-5 w-5" />
                      <span>Gửi Yêu Cầu</span>
                    </div>
                  )}
                </Button>

                <p className="text-center text-sm text-slate-500 mt-4">
                  Chúng tôi sẽ cố gắng cập nhật phim trong vòng 24-48h nếu yêu cầu được duyệt.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
