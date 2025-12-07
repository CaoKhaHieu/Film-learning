import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Mail, MessageSquare, Phone, MapPin } from "lucide-react";

export const metadata = {
  title: 'Liên Hệ - Film Learning',
  description: 'Liên hệ với đội ngũ Film Learning để được hỗ trợ',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="container mx-auto px-4 py-24 max-w-5xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Liên Hệ Với Chúng Tôi
          </h1>
          <p className="text-slate-600 text-lg">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Thông Tin Liên Hệ</h2>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center border border-yellow-200">
                    <Mail className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Email</h3>
                    <p className="text-slate-600">support@filmlearning.com</p>
                    <p className="text-slate-600 text-sm">Phản hồi trong vòng 24 giờ</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center border border-yellow-200">
                    <Phone className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Hotline</h3>
                    <p className="text-slate-600">1900 xxxx</p>
                    <p className="text-slate-600 text-sm">Thứ 2 - Thứ 6: 9:00 - 18:00</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center border border-yellow-200">
                    <MessageSquare className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Live Chat</h3>
                    <p className="text-slate-600">Trò chuyện trực tiếp</p>
                    <p className="text-slate-600 text-sm">Sẵn sàng hỗ trợ 24/7</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center border border-yellow-200">
                    <MapPin className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Địa Chỉ</h3>
                    <p className="text-slate-600">123 Đường ABC, Quận 1</p>
                    <p className="text-slate-600">TP. Hồ Chí Minh, Việt Nam</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-8 border border-yellow-200">
              <h2 className="text-xl font-black text-slate-900 mb-4">Kết Nối Với Chúng Tôi</h2>
              <p className="text-slate-700 mb-4">
                Theo dõi chúng tôi trên mạng xã hội để cập nhật tin tức mới nhất
              </p>
              <div className="flex gap-3">
                <a href="#" className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg font-medium border border-slate-200 transition-colors">
                  Facebook
                </a>
                <a href="#" className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg font-medium border border-slate-200 transition-colors">
                  Instagram
                </a>
                <a href="#" className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg font-medium border border-slate-200 transition-colors">
                  Youtube
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Gửi Tin Nhắn</h2>

            <form className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-2">
                  Họ và Tên *
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-bold text-slate-700 mb-2">
                  Tiêu Đề *
                </label>
                <input
                  type="text"
                  id="subject"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Vấn đề cần hỗ trợ"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-bold text-slate-700 mb-2">
                  Nội Dung *
                </label>
                <textarea
                  id="message"
                  rows={6}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
                  placeholder="Mô tả chi tiết vấn đề của bạn..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-4 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Gửi Tin Nhắn
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
