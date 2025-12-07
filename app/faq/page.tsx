import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: 'Câu Hỏi Thường Gặp - Film Learning',
  description: 'Câu trả lời cho các câu hỏi thường gặp về Film Learning',
};

export default function FAQPage() {
  const faqs = [
    {
      question: "Film Learning là gì?",
      answer: "Film Learning là nền tảng học tiếng Anh qua phim với phụ đề song ngữ thông minh. Chúng tôi cung cấp hàng trăm bộ phim được phân loại theo cấp độ, giúp bạn học tiếng Anh một cách tự nhiên và thú vị."
    },
    {
      question: "Tôi cần trình độ tiếng Anh như thế nào để bắt đầu?",
      answer: "Bạn có thể bắt đầu với bất kỳ trình độ nào! Chúng tôi có phim cho người mới bắt đầu (Beginner), trung cấp (Intermediate) và nâng cao (Advanced). Hãy chọn cấp độ phù hợp với khả năng hiện tại của bạn."
    },
    {
      question: "Tôi có thể xem phim offline không?",
      answer: "Hiện tại, Film Learning chỉ hỗ trợ xem phim online. Bạn cần kết nối internet để truy cập và xem phim. Chúng tôi đang phát triển tính năng tải xuống để xem offline trong tương lai."
    },
    {
      question: "Làm thế nào để sử dụng phụ đề hiệu quả?",
      answer: "Bạn nên xem với cả hai phụ đề tiếng Anh và tiếng Việt lần đầu tiên. Sau đó, thử xem lại chỉ với phụ đề tiếng Anh. Cuối cùng, thử thách bản thân bằng cách tắt hẳn phụ đề để kiểm tra khả năng nghe hiểu."
    },
    {
      question: "Tôi nên xem mỗi phim bao nhiêu lần?",
      answer: "Không có quy định cụ thể, nhưng chúng tôi khuyên bạn nên xem mỗi phim ít nhất 2-3 lần. Lần đầu để hiểu nội dung, lần sau để tập trung vào từ vựng và phát âm, và lần cuối để thử thách khả năng nghe hiểu mà không cần phụ đề."
    },
    {
      question: "Film Learning có miễn phí không?",
      answer: "Chúng tôi cung cấp cả gói miễn phí và gói VIP. Gói miễn phí cho phép bạn truy cập một số lượng phim nhất định. Gói VIP mở khóa toàn bộ thư viện phim và các tính năng nâng cao."
    },
    {
      question: "Tôi có thể học được gì từ việc xem phim?",
      answer: "Bạn sẽ cải thiện kỹ năng nghe, mở rộng vốn từ vựng, học được cách phát âm tự nhiên, hiểu văn hóa và cách giao tiếp của người bản xứ. Đây là phương pháp học tiếng Anh vừa hiệu quả vừa thú vị."
    },
    {
      question: "Làm sao để theo dõi tiến độ học tập?",
      answer: "Hiện tại, bạn có thể tự theo dõi bằng cách ghi chú các phim đã xem và từ vựng đã học. Chúng tôi đang phát triển tính năng theo dõi tiến độ tự động trong các phiên bản tiếp theo."
    },
    {
      question: "Tôi gặp vấn đề kỹ thuật, phải làm sao?",
      answer: "Hãy liên hệ với chúng tôi qua trang Liên Hệ hoặc email support@filmlearning.com. Đội ngũ hỗ trợ của chúng tôi sẽ phản hồi trong vòng 24 giờ."
    },
    {
      question: "Phim có phụ đề tiếng Việt chính xác không?",
      answer: "Chúng tôi cố gắng cung cấp phụ đề tiếng Việt chính xác nhất có thể. Tuy nhiên, đôi khi có thể có sai sót nhỏ. Nếu bạn phát hiện lỗi, hãy báo cáo cho chúng tôi để cải thiện chất lượng."
    }
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="container mx-auto px-4 py-24 max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Câu Hỏi Thường Gặp
          </h1>
          <p className="text-slate-600 text-lg">
            Tìm câu trả lời cho các thắc mắc phổ biến về Film Learning
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-3">
                {index + 1}. {faq.question}
              </h3>
              <p className="text-slate-700 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-8 border border-yellow-200 text-center">
          <h2 className="text-2xl font-black text-slate-900 mb-3">
            Không tìm thấy câu trả lời?
          </h2>
          <p className="text-slate-700 mb-6">
            Hãy liên hệ với chúng tôi và đội ngũ hỗ trợ sẽ giúp bạn giải đáp mọi thắc mắc.
          </p>
          <a
            href="/contact"
            className="inline-block px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Liên Hệ Ngay
          </a>
        </div>
      </div>

      <Footer />
    </main>
  );
}
