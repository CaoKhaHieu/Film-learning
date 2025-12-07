import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Target, Users, Award, Zap } from "lucide-react";

export const metadata = {
  title: 'Giới Thiệu - Film Learning',
  description: 'Tìm hiểu về Film Learning - Nền tảng học tiếng Anh qua phim hàng đầu',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="container mx-auto px-4 py-24 max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Về Film Learning
          </h1>
          <p className="text-slate-600 text-lg">
            Nền tảng học tiếng Anh qua phim song ngữ hàng đầu Việt Nam
          </p>
        </div>

        {/* Story */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200 mb-8">
          <h2 className="text-2xl font-black text-slate-900 mb-4">Câu Chuyện Của Chúng Tôi</h2>
          <div className="space-y-4 text-slate-700 leading-relaxed">
            <p>
              Film Learning ra đời từ niềm đam mê học tiếng Anh qua phim ảnh. Chúng tôi tin rằng việc học ngôn ngữ không nhất thiết phải nhàm chán và căng thẳng. Thay vào đó, nó có thể trở thành một trải nghiệm thú vị và tự nhiên thông qua những bộ phim bạn yêu thích.
            </p>
            <p>
              Với đội ngũ giáo viên và chuyên gia ngôn ngữ giàu kinh nghiệm, chúng tôi đã xây dựng một thư viện phim phong phú, được phân loại cẩn thận theo cấp độ và chủ đề. Mỗi bộ phim đều được trang bị phụ đề song ngữ chính xác, giúp bạn vừa thưởng thức phim vừa học tiếng Anh hiệu quả.
            </p>
            <p>
              Hành trình của chúng tôi bắt đầu từ năm 2024 với mục tiêu đơn giản: Giúp người Việt học tiếng Anh một cách tự nhiên và thú vị nhất. Đến nay, hàng ngàn học viên đã tin tưởng và đồng hành cùng Film Learning trên con đường chinh phục tiếng Anh.
            </p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
            <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-slate-900" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-3">Sứ Mệnh</h2>
            <p className="text-slate-700 leading-relaxed">
              Mang đến phương pháp học tiếng Anh hiệu quả, tự nhiên và thú vị thông qua phim ảnh, giúp mọi người tự tin giao tiếp tiếng Anh trong cuộc sống và công việc.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
            <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-slate-900" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-3">Tầm Nhìn</h2>
            <p className="text-slate-700 leading-relaxed">
              Trở thành nền tảng học tiếng Anh qua phim số 1 tại Việt Nam, đồng hành cùng hàng triệu người Việt trên hành trình chinh phục ngôn ngữ toàn cầu.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200 mb-8">
          <h2 className="text-2xl font-black text-slate-900 mb-6">Giá Trị Cốt Lõi</h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-yellow-400 mt-2"></div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Chất Lượng</h3>
                <p className="text-slate-700">
                  Cam kết cung cấp nội dung chất lượng cao với phụ đề chính xác và phim được chọn lọc kỹ càng.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-yellow-400 mt-2"></div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Hiệu Quả</h3>
                <p className="text-slate-700">
                  Phương pháp học được thiết kế dựa trên nghiên cứu khoa học về việc học ngôn ngữ tự nhiên.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-yellow-400 mt-2"></div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Thú Vị</h3>
                <p className="text-slate-700">
                  Học tiếng Anh không còn là gánh nặng mà là niềm vui mỗi ngày với những bộ phim hấp dẫn.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-yellow-400 mt-2"></div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Tận Tâm</h3>
                <p className="text-slate-700">
                  Luôn lắng nghe và hỗ trợ học viên, không ngừng cải thiện trải nghiệm học tập.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-6 border border-yellow-200 text-center">
            <div className="text-4xl font-black text-slate-900 mb-2">500+</div>
            <div className="text-slate-700 font-medium">Bộ Phim</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-6 border border-yellow-200 text-center">
            <div className="text-4xl font-black text-slate-900 mb-2">10K+</div>
            <div className="text-slate-700 font-medium">Học Viên</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-6 border border-yellow-200 text-center">
            <div className="text-4xl font-black text-slate-900 mb-2">4.8/5</div>
            <div className="text-slate-700 font-medium">Đánh Giá</div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
