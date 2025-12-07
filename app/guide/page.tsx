import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Play, Search, Subtitles, BookOpen, Volume2, Settings } from "lucide-react";

export const metadata = {
  title: 'Hướng Dẫn Sử Dụng - Film Learning',
  description: 'Hướng dẫn chi tiết cách sử dụng Film Learning để học tiếng Anh hiệu quả',
};

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="container mx-auto px-4 py-24 max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Hướng Dẫn Sử Dụng
          </h1>
          <p className="text-slate-600 text-lg">
            Tìm hiểu cách sử dụng Film Learning để học tiếng Anh hiệu quả nhất
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Section 1 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                <Search className="w-5 h-5 text-slate-900" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">1. Tìm Phim Phù Hợp</h2>
            </div>
            <div className="space-y-3 text-slate-700">
              <p>
                <strong>Chọn theo cấp độ:</strong> Truy cập vào các trang Cơ Bản, Trung Cấp, hoặc Nâng Cao để tìm phim phù hợp với trình độ của bạn.
              </p>
              <p>
                <strong>Tìm kiếm:</strong> Sử dụng thanh tìm kiếm ở góc trên bên phải để tìm phim theo tên.
              </p>
              <p>
                <strong>Xem chi tiết:</strong> Click vào poster phim để xem thông tin chi tiết, đánh giá, và mức độ phù hợp.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                <Play className="w-5 h-5 text-slate-900" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">2. Xem Phim</h2>
            </div>
            <div className="space-y-3 text-slate-700">
              <p>
                <strong>Bắt đầu xem:</strong> Click nút "Xem Phim" màu vàng trên trang chi tiết phim.
              </p>
              <p>
                <strong>Điều khiển video:</strong> Sử dụng các nút play/pause, tua nhanh, điều chỉnh âm lượng như trình phát video thông thường.
              </p>
              <p>
                <strong>Chế độ toàn màn hình:</strong> Click vào icon fullscreen để xem ở chế độ toàn màn hình.
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                <Subtitles className="w-5 h-5 text-slate-900" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">3. Sử Dụng Phụ Đề</h2>
            </div>
            <div className="space-y-3 text-slate-700">
              <p>
                <strong>Phụ đề song ngữ:</strong> Phụ đề tiếng Anh và tiếng Việt hiển thị đồng thời giúp bạn dễ dàng đối chiếu và học từ vựng.
              </p>
              <p>
                <strong>Click vào phụ đề:</strong> Click vào bất kỳ câu phụ đề nào trong sidebar để nhảy đến thời điểm đó trong video.
              </p>
              <p>
                <strong>Tự động cuộn:</strong> Sidebar phụ đề tự động cuộn theo tiến trình video, giúp bạn dễ dàng theo dõi.
              </p>
            </div>
          </div>

          {/* Section 4 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-slate-900" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">4. Học Hiệu Quả</h2>
            </div>
            <div className="space-y-3 text-slate-700">
              <p>
                <strong>Xem nhiều lần:</strong> Đừng ngại xem lại cùng một đoạn nhiều lần để hiểu rõ hơn.
              </p>
              <p>
                <strong>Ghi chú từ vựng:</strong> Pause video và ghi lại các từ vựng mới bạn gặp.
              </p>
              <p>
                <strong>Bắt chước phát âm:</strong> Lặp lại theo các câu thoại để cải thiện phát âm và ngữ điệu.
              </p>
              <p>
                <strong>Học đều đặn:</strong> Dành 20-30 phút mỗi ngày để xem phim và học từ vựng mới.
              </p>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-8 border border-yellow-200">
            <h2 className="text-2xl font-black text-slate-900 mb-4">💡 Mẹo Học Tập</h2>
            <ul className="space-y-2 text-slate-700">
              <li className="flex gap-3">
                <span className="text-yellow-600 font-bold">•</span>
                <span>Bắt đầu với phim cấp độ thấp hơn trình độ của bạn để tự tin hơn</span>
              </li>
              <li className="flex gap-3">
                <span className="text-yellow-600 font-bold">•</span>
                <span>Chọn phim thuộc thể loại bạn yêu thích để duy trì động lực</span>
              </li>
              <li className="flex gap-3">
                <span className="text-yellow-600 font-bold">•</span>
                <span>Tắt phụ đề tiếng Việt sau khi đã quen với nội dung để thử thách bản thân</span>
              </li>
              <li className="flex gap-3">
                <span className="text-yellow-600 font-bold">•</span>
                <span>Tạo danh sách từ vựng riêng và ôn tập thường xuyên</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
