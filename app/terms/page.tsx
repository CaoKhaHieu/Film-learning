import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: 'Điều Khoản Sử Dụng - Film Learning',
  description: 'Điều khoản và điều kiện sử dụng dịch vụ Film Learning',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="container mx-auto px-4 py-24 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Điều Khoản Sử Dụng
          </h1>
          <p className="text-slate-600">
            Cập nhật lần cuối: Tháng 12, 2024
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200 space-y-8">
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">1. Chấp Nhận Điều Khoản</h2>
            <p className="text-slate-700 leading-relaxed">
              Bằng việc truy cập và sử dụng Film Learning, bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản và điều kiện sau đây. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng dịch vụ của chúng tôi.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">2. Tài Khoản Người Dùng</h2>
            <div className="space-y-3 text-slate-700 leading-relaxed">
              <p>
                <strong>2.1.</strong> Bạn cần tạo tài khoản để sử dụng đầy đủ các tính năng của Film Learning.
              </p>
              <p>
                <strong>2.2.</strong> Bạn chịu trách nhiệm duy trì tính bảo mật của tài khoản và mật khẩu của mình.
              </p>
              <p>
                <strong>2.3.</strong> Bạn phải cung cấp thông tin chính xác, đầy đủ và cập nhật khi đăng ký tài khoản.
              </p>
              <p>
                <strong>2.4.</strong> Bạn không được chia sẻ tài khoản của mình với người khác hoặc cho phép người khác truy cập vào tài khoản của bạn.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">3. Quyền Sử Dụng</h2>
            <div className="space-y-3 text-slate-700 leading-relaxed">
              <p>
                <strong>3.1.</strong> Film Learning cấp cho bạn quyền sử dụng cá nhân, không độc quyền, không thể chuyển nhượng để truy cập và sử dụng dịch vụ.
              </p>
              <p>
                <strong>3.2.</strong> Bạn không được sao chép, tải xuống, phân phối, hoặc sử dụng nội dung của Film Learning cho mục đích thương mại mà không có sự cho phép bằng văn bản.
              </p>
              <p>
                <strong>3.3.</strong> Bạn không được sử dụng bất kỳ công cụ tự động nào để truy cập hoặc thu thập dữ liệu từ Film Learning.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">4. Nội Dung và Bản Quyền</h2>
            <div className="space-y-3 text-slate-700 leading-relaxed">
              <p>
                <strong>4.1.</strong> Tất cả nội dung trên Film Learning, bao gồm phim, phụ đề, hình ảnh, và văn bản, đều được bảo vệ bởi luật bản quyền.
              </p>
              <p>
                <strong>4.2.</strong> Film Learning tôn trọng quyền sở hữu trí tuệ của người khác và yêu cầu người dùng cũng làm như vậy.
              </p>
              <p>
                <strong>4.3.</strong> Nếu bạn tin rằng nội dung của bạn đã bị sử dụng trái phép, vui lòng liên hệ với chúng tôi.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">5. Thanh Toán và Hoàn Tiền</h2>
            <div className="space-y-3 text-slate-700 leading-relaxed">
              <p>
                <strong>5.1.</strong> Gói VIP được thanh toán theo tháng hoặc năm. Phí sẽ được tự động gia hạn trừ khi bạn hủy trước kỳ thanh toán tiếp theo.
              </p>
              <p>
                <strong>5.2.</strong> Chúng tôi cung cấp chính sách hoàn tiền trong vòng 7 ngày nếu bạn không hài lòng với dịch vụ.
              </p>
              <p>
                <strong>5.3.</strong> Để yêu cầu hoàn tiền, vui lòng liên hệ với bộ phận hỗ trợ khách hàng.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">6. Hành Vi Bị Cấm</h2>
            <div className="space-y-3 text-slate-700 leading-relaxed">
              <p>Bạn đồng ý không:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Vi phạm bất kỳ luật hoặc quy định nào</li>
                <li>Xâm phạm quyền của người khác</li>
                <li>Tải lên hoặc truyền tải virus hoặc mã độc hại</li>
                <li>Spam hoặc gửi tin nhắn không mong muốn</li>
                <li>Cố gắng truy cập trái phép vào hệ thống của chúng tôi</li>
                <li>Sử dụng dịch vụ cho mục đích bất hợp pháp</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">7. Chấm Dứt Dịch Vụ</h2>
            <div className="space-y-3 text-slate-700 leading-relaxed">
              <p>
                <strong>7.1.</strong> Chúng tôi có quyền tạm ngưng hoặc chấm dứt tài khoản của bạn nếu bạn vi phạm các điều khoản này.
              </p>
              <p>
                <strong>7.2.</strong> Bạn có thể hủy tài khoản của mình bất cứ lúc nào thông qua cài đặt tài khoản.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">8. Giới Hạn Trách Nhiệm</h2>
            <p className="text-slate-700 leading-relaxed">
              Film Learning cung cấp dịch vụ "nguyên trạng" và không đảm bảo rằng dịch vụ sẽ không bị gián đoạn hoặc không có lỗi. Chúng tôi không chịu trách nhiệm cho bất kỳ thiệt hại trực tiếp, gián tiếp, ngẫu nhiên, hoặc hậu quả nào phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">9. Thay Đổi Điều Khoản</h2>
            <p className="text-slate-700 leading-relaxed">
              Chúng tôi có quyền sửa đổi các điều khoản này bất cứ lúc nào. Các thay đổi sẽ có hiệu lực ngay khi được đăng tải trên trang web. Việc bạn tiếp tục sử dụng dịch vụ sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4">10. Liên Hệ</h2>
            <p className="text-slate-700 leading-relaxed">
              Nếu bạn có bất kỳ câu hỏi nào về Điều Khoản Sử Dụng này, vui lòng liên hệ với chúng tôi qua email: <a href="mailto:legal@filmlearning.com" className="text-yellow-600 hover:text-yellow-700 font-medium">legal@filmlearning.com</a>
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
