import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black/90 text-gray-400 py-12 px-4 md:px-16 border-t border-gray-800 mt-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-4">RaPhim</h3>
          <p className="text-sm leading-relaxed">
            Trải nghiệm xem phim đỉnh cao với hàng ngàn bộ phim bom tấn, phim bộ và chương trình truyền hình hấp dẫn.
          </p>
          <div className="flex gap-4 mt-6">
            <a href="#" className="hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
            <a href="#" className="hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="hover:text-white transition-colors"><Youtube className="w-5 h-5" /></a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4">Khám phá</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-yellow-500 transition-colors">Phim mới</a></li>
            <li><a href="#" className="hover:text-yellow-500 transition-colors">Phim bộ</a></li>
            <li><a href="#" className="hover:text-yellow-500 transition-colors">Phim lẻ</a></li>
            <li><a href="#" className="hover:text-yellow-500 transition-colors">TV Shows</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4">Hỗ trợ</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-yellow-500 transition-colors">FAQ</a></li>
            <li><a href="#" className="hover:text-yellow-500 transition-colors">Trung tâm trợ giúp</a></li>
            <li><a href="#" className="hover:text-yellow-500 transition-colors">Tài khoản</a></li>
            <li><a href="#" className="hover:text-yellow-500 transition-colors">Liên hệ</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4">Thông tin</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-yellow-500 transition-colors">Điều khoản sử dụng</a></li>
            <li><a href="#" className="hover:text-yellow-500 transition-colors">Chính sách quyền riêng tư</a></li>
            <li><a href="#" className="hover:text-yellow-500 transition-colors">Bản quyền</a></li>
          </ul>
        </div>
      </div>

      <div className="text-center text-xs mt-12 pt-8 border-t border-gray-800">
        &copy; 2024 RaPhim. All rights reserved.
      </div>
    </footer>
  );
}
