import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-100 text-slate-500 py-12 px-4 md:px-16 border-t border-slate-200 mt-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-slate-900 font-bold text-lg mb-4">Film Learning</h3>
          <p className="text-sm leading-relaxed mb-4">
            Nền tảng học tiếng Anh qua phim hàng đầu với phụ đề song ngữ thông minh.
            Cải thiện kỹ năng nghe nói và từ vựng một cách tự nhiên và thú vị.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-900 transition-colors" aria-label="Facebook"><Facebook className="w-5 h-5" /></a>
            <a href="#" className="hover:text-slate-900 transition-colors" aria-label="Instagram"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="hover:text-slate-900 transition-colors" aria-label="Twitter"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="hover:text-slate-900 transition-colors" aria-label="Youtube"><Youtube className="w-5 h-5" /></a>
          </div>
        </div>

        <div>
          <h4 className="text-slate-900 font-bold mb-4">Học Tập</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/beginner" className="hover:text-yellow-600 transition-colors">Cấp độ Cơ bản</a></li>
            <li><a href="/intermediate" className="hover:text-yellow-600 transition-colors">Cấp độ Trung cấp</a></li>
            <li><a href="/advanced" className="hover:text-yellow-600 transition-colors">Cấp độ Nâng cao</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-slate-900 font-bold mb-4">Hỗ Trợ</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-yellow-600 transition-colors">Hướng dẫn sử dụng</a></li>
            <li><a href="#" className="hover:text-yellow-600 transition-colors">Câu hỏi thường gặp</a></li>
            <li><a href="#" className="hover:text-yellow-600 transition-colors">Liên hệ</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-slate-900 font-bold mb-4">Về Chúng Tôi</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-yellow-600 transition-colors">Giới thiệu</a></li>
            <li><a href="#" className="hover:text-yellow-600 transition-colors">Điều khoản sử dụng</a></li>
            <li><a href="#" className="hover:text-yellow-600 transition-colors">Chính sách bảo mật</a></li>
          </ul>
        </div>
      </div>

      <div className="text-center text-xs mt-12 pt-8 border-t border-slate-200">
        <p>&copy; 2024 Film Learning. Nền tảng học tiếng Anh qua phim song ngữ.</p>
      </div>
    </footer>
  );
}
